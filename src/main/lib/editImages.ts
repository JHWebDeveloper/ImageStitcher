import sharp, { FormatEnum, type Metadata, type Region, type Sharp } from 'sharp'

import { ALIGNMENT_TYPE, DEFAULT_VALUE, ERROR_MSG, FIT_TYPE, LOSSLESS_IMAGE_FORMAT, PREVIEW_IMAGE_FORMAT, SIDE } from '../constants'
import type { AlignmentTypeValue, FitTypeValue, StitchOptions, StitchResultRaw } from '../types'
import { formatBase64String, xor } from '../utilities'

import type { ImageStitchData, ImageUploadData } from './uploadImages'

const getAlphaFormat = (isPreview: boolean) => (
	isPreview ? PREVIEW_IMAGE_FORMAT : LOSSLESS_IMAGE_FORMAT
)

function returnFitType(fitType: FitTypeValue) {
	if (fitType === FIT_TYPE.CONTAIN) {
		return sharp.fit.contain
	}

	return sharp.fit.cover
}

function returnAlignmentType(alignmentType: AlignmentTypeValue, isVertical: boolean)  {
	if (isVertical && alignmentType === ALIGNMENT_TYPE.START) {
		return 'left'
	} else if (isVertical && alignmentType === ALIGNMENT_TYPE.END) {
		return 'right'
	} else if (alignmentType === ALIGNMENT_TYPE.START) {
		return 'top'
	} else if (alignmentType === ALIGNMENT_TYPE.END) {
		return 'bottom'
	}

	return 'centre'
}

export async function getFormatFromBuffer(buffer: Buffer<ArrayBufferLike>) {
	const { format } = await sharp(buffer).metadata()

	return format
}

export async function convertBufferToBase64(
	imgPathOrBuffer: string | Buffer<ArrayBufferLike>,
	format: keyof FormatEnum
) {
	let buffer: Buffer<ArrayBufferLike>

	if (typeof imgPathOrBuffer === 'string') {
		buffer = await sharp(imgPathOrBuffer).toBuffer()
	} else {
		buffer = imgPathOrBuffer
	}

	return formatBase64String(buffer.toString('base64'), format || await getFormatFromBuffer(format)) 
}

export async function prepareImage(
	image: ImageUploadData,
	isPreview: boolean
) {
	if (!image.srcPath) throw new Error(ERROR_MSG.MISSING_SOURCE_FILE)

	let preparedImage = sharp(image.srcPath)

	if (image.flip) preparedImage = preparedImage.flip()
	if (image.flop) preparedImage = preparedImage.flop()
	if (image.angle) preparedImage = preparedImage.rotate(image.angle)

	preparedImage = preparedImage.toFormat(isPreview ? PREVIEW_IMAGE_FORMAT : LOSSLESS_IMAGE_FORMAT)
	
	return sharp(await preparedImage.toBuffer())
}

function scaleImage(
	imgA: Sharp,
	imgB: Sharp,
	metadataA: Metadata,
	metadataB: Metadata,
	{
		isVertical,
		isContain,
		isResize,
		prefersLargerImage,
		fitType,
		alignmentType,
		background
	}: ImageStitchData,
	isPreview = false
) {
	const axis: keyof Metadata = isVertical ? 'width' : 'height'

	if (!metadataA[axis] || !metadataB[axis] || metadataA[axis] === metadataB[axis]) return []

	const oppositeAxis: keyof Metadata = isVertical ? 'height' : 'width'
	const needsAlpha = isContain && ((background?.alpha ?? 1) < 1)
	const isALarger = metadataA[axis] > metadataB[axis]
	let imgAResized: Sharp | undefined
	let imgBResized: Sharp | undefined
	
	if (needsAlpha && !metadataA.hasAlpha && isALarger) {
		imgB = imgB.toFormat(getAlphaFormat(isPreview))
	} else if (needsAlpha && !metadataA.hasAlpha && !isALarger) {
		imgA = imgA.toFormat(getAlphaFormat(isPreview))
	}

	if (xor(prefersLargerImage, isALarger)) {
		imgAResized = imgA.resize({
			[axis]: metadataB[axis],
			...isResize ? {} : {
				[oppositeAxis]: metadataA[oppositeAxis],
				fit: returnFitType(fitType),
				position: returnAlignmentType(alignmentType, isVertical),
				...isContain ? { background } : {}
			}
		})
	} else {
		imgBResized = imgB.resize({
			[axis]: metadataA[axis],
			...isResize ? {} : {
				[oppositeAxis]: metadataB[oppositeAxis],
				fit: returnFitType(fitType),
				position: returnAlignmentType(alignmentType, isVertical),
				...isContain ? { background } : {}
			}
		})
	}

	return [imgAResized, imgBResized]
}

async function cropImage(preparedImage: Sharp, image: ImageUploadData, isVertical: boolean) {
	if (image.crop === 1) return

	const { width, height } = await preparedImage.metadata()

	const region = {
		top: 0,
		left: 0,
		width,
		height
	} satisfies Region

	if (isVertical) {
		region.height = Math.round(height * image.crop)
	} else {
		region.width = Math.round(width * image.crop)
	}

	if (image.name === SIDE.B && isVertical) {
		region.top = height - region.height
	} else if (image.name === SIDE.B) {
		region.left = width - region.width
	}

	preparedImage = preparedImage.extract(region)

	return preparedImage
}

function cropImages(
	imageA: Sharp,
	imageB: Sharp,
	imageStitch: ImageStitchData
) {
	return Promise.all([
		imageStitch.A.crop ? cropImage(imageA, imageStitch.A, imageStitch.isVertical) : Promise.resolve(),
		imageStitch.B.crop ? cropImage(imageB, imageStitch.B, imageStitch.isVertical) : Promise.resolve()
	])
}

async function resizeImageForPreview(
	image: Sharp,
	width?: number,
	height?: number
) {
	if (!width || !!height) return image

	return sharp(await image.webp().toBuffer()).resize(width, height, {
		fit: sharp.fit.inside,
		withoutEnlargement: true
	}).toFormat(
		PREVIEW_IMAGE_FORMAT,
		{
			quality: 60,
			effort: 0
		}
	).rotate() // removes metadata
}

export async function renderSingleImage(
	image: ImageUploadData,
	{
		isPreview = false,
		format = DEFAULT_VALUE.FORMAT,
		maxWidth,
		maxHeight
	}: StitchOptions
): Promise<StitchResultRaw> {
	if (!image.srcPath) throw new Error(ERROR_MSG.MISSING_SOURCE_FILE)

	let preparedImage = await image.prepare(isPreview)

	if (isPreview) {
		preparedImage = await resizeImageForPreview(preparedImage, maxWidth, maxHeight)
	} else {
		preparedImage = preparedImage.toFormat(format)
	}

	const [ result, { format: imageAFormat } ] = await Promise.all([
		preparedImage.toBuffer(),
		sharp(image.srcPath).metadata()
	])

	return {
		result,
		imageAFormat,
		hasSizeDifference: false
	}
}

export async function stitchImages(
	imageStitcher: ImageStitchData,
	{
		isPreview = false,
		format = DEFAULT_VALUE.FORMAT,
		maxHeight,
		maxWidth
	}: StitchOptions
): Promise<StitchResultRaw> {
	const { isVertical, prefersLargerImage } = imageStitcher
	const maxOrMin: keyof Math = prefersLargerImage ? 'max' : 'min'
	const renderFormat = isPreview ? PREVIEW_IMAGE_FORMAT : LOSSLESS_IMAGE_FORMAT
	let imgA = await imageStitcher.A.prepare(isPreview)
	let imgB = await imageStitcher.B.prepare(isPreview)
	let canvasWidth: number | undefined
	let canvasHeight: number | undefined

	let [ metadataA, metadataB ] = await Promise.all([
		imgA.metadata(),
		imgB.metadata()
	])

	const hasSizeDifference = isVertical ? metadataA.height !== metadataB.height : metadataA.width !== metadataB.width
	const imageAFormat = metadataA.format

	const [ imgAResized, imgBResized ] = scaleImage(
		imgA,
		imgB,
		metadataA,
		metadataB,
		imageStitcher,
		isPreview
	)

	if (isVertical) {
		canvasWidth = Math[maxOrMin](metadataA.width, metadataB.width)
	} else {
		canvasHeight = Math[maxOrMin](metadataA.height, metadataB.height)
	}

	if (imgAResized) {
		imgA = sharp(await imgAResized.toFormat(renderFormat).toBuffer())
		metadataA = await imgA.metadata()
	}

	if (imgBResized) {
		imgB = sharp(await imgBResized.toFormat(renderFormat).toBuffer())
		metadataB = await imgB.metadata()
	}

	const [ imageACropped, imageBCropped ] = await cropImages(imgA, imgB, imageStitcher)

	if (imageACropped) {
		imgA = sharp(await imageACropped.toFormat(renderFormat).toBuffer())
		metadataA = await imgA.metadata()
	}

	if (imageBCropped) {
		imgB = sharp(await imageBCropped.toFormat(renderFormat).toBuffer())
		metadataB = await imgB.metadata()
	}

	if (isVertical) {
		canvasHeight = metadataA.height + metadataB.height
	} else {
		canvasWidth = metadataA.width + metadataB.width
	}

	let result = imgA
		.resize(canvasWidth, canvasHeight, {
			fit: sharp.fit.contain,
			position: isVertical ? 'top' : 'left',
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		})
		.composite([
			{
				input: await imgB.toFormat(renderFormat).toBuffer(),
				top: isVertical ? metadataA.height : 0,
				left: isVertical ? 0 : metadataA.width
			}
		])

	if (isPreview) {
		result = await resizeImageForPreview(result, maxWidth, maxHeight)
	} else {
		result = result.toFormat(format)
	}
	
	return {
		result: await result.toBuffer(),
		hasSizeDifference,
		imageAFormat
	}
}
