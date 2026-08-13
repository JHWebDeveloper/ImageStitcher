import { promises as fsp } from 'node:fs'
import path from 'node:path'
import type { WebContents } from 'electron'
import type { FormatEnum } from 'sharp'

import { DEFAULT_VALUE, ERROR_MSG, FIT_TYPE, FORMAT, POST_SAVE_ACTION, PREVIEW_IMAGE_FORMAT, SIDE, UPLOADS_PATH } from '../constants'
import type { AdjustStitchOpts, AlignmentTypeValue, FitTypeValue, RotateOptions, SaveOptions, SideOption, StitchOptions, StitchResult, StitchResultRaw, Side, UploadImageOptions } from '../types'
import { arrayIsNullOrEmpty, doesFileExist, hexToRgb, swapPropertiesMutative, xor } from '../utilities'

import { emptyUploadDirectory, selectImageDialog } from './fileHandlers'
import { convertBufferToBase64, getFormatFromBuffer, prepareImage, renderSingleImage, stitchImages } from './editImages'
import { saveImage } from './fileHandlers'

interface ToggleOrientationOps {
	shouldRotate?: boolean
	shouldSwap?: boolean
}

export class ImageUploadData {
	name: Side
	originalPath: string | null = null
	srcPath: string | null = null
	angle = DEFAULT_VALUE.ANGLE
	flip = DEFAULT_VALUE.FLIP
	flop = DEFAULT_VALUE.FLOP
	private _crop = 1

	constructor(imageName: Side) {
		this.name = imageName
	}

	get hasOriginal() {
		return !xor(!!this.srcPath, !!this.originalPath)
	}

	set crop(value: number) {
		this._crop = (100 - value || 1) / 100
	}

	get crop() {
		return this._crop
	}

	get cropPercent() {
		return (this.name === SIDE.B ? 1 - this.crop + 1 : this.crop) * 100
	}

	get isLoaded() {
		return !!this.srcPath
	}

	get isSideways() {
		return !!(this.angle % 180)
	}

	prepare(isPreview: boolean) {
		return prepareImage(this, isPreview)
	}

	resetMetadata() {
		this.originalPath = null
		this.srcPath = null
		this.angle = DEFAULT_VALUE.ANGLE
		this.flip = DEFAULT_VALUE.FLIP
		this.flop = DEFAULT_VALUE.FLOP
		this._crop = 1
	}

	async rotate(ccw?: boolean) {
		this.angle += ccw ? -90 : 90
		this.angle %= 360
	}

	async uploadImage(
		pathOrBuffer: string | Buffer<ArrayBufferLike>,
		format?: typeof pathOrBuffer extends string ? never : keyof FormatEnum
	) {
		let srcPath: string

		this.resetMetadata()

		if (typeof pathOrBuffer === 'string') {
			srcPath = path.join(UPLOADS_PATH, `${this.name}${path.extname(pathOrBuffer)}`)

			await fsp.copyFile(pathOrBuffer, srcPath)

			this.originalPath = pathOrBuffer
		} else {
			srcPath = path.join(UPLOADS_PATH, `${this.name}.${format || await getFormatFromBuffer(pathOrBuffer)}`)

			await fsp.writeFile(srcPath, pathOrBuffer)

			this.originalPath = null
		}

		this.srcPath = srcPath // only update srcPath once image is successfully copied
	}

	async removeImage() {
		if (this.srcPath && await doesFileExist(this.srcPath)) {
			await fsp.unlink(this.srcPath)
		}

		this.resetMetadata()
	}

	toggleFlip() {
		this.flip = !this.flip
	}

	toggleFlop() {
		this.flop = !this.flop
	}
}

function getImageAFormat(format?: keyof FormatEnum) {
	return format && Object.values(FORMAT).includes(format) ? format : DEFAULT_VALUE.FORMAT
}

export class ImageStitchData implements Record<Side, ImageUploadData> {
	A = new ImageUploadData(SIDE.A)
	B = new ImageUploadData(SIDE.B)
	previewMaxWidth = 0
	previewMaxHeight = 0
	isVertical = DEFAULT_VALUE.IS_VERTICAL
	fitType: FitTypeValue = DEFAULT_VALUE.FIT_TYPE
	alignmentType: AlignmentTypeValue = DEFAULT_VALUE.ALIGNMENT_TYPE
	private _background = DEFAULT_VALUE.BACKGROUND_COLOR_RGB

	get background() {
		return this._background
	}

	set background(bg: typeof this._background) {
		this._background = bg
	}

	set backgroundColor(hex: string) {
		this.background = {
			...this.background,
			...hexToRgb(hex)
		}
	}

	set backgroundOpacity(prc: number) {
		this.background = {
			...this.background,
			alpha: prc / 100
		}
	}

	get isUpscale() {
		return this.fitType === FIT_TYPE.UPSCALE
	}

	get isContain() {
		return this.fitType === FIT_TYPE.CONTAIN
	}

	get isResize() {
		return this.isUpscale || this.fitType === FIT_TYPE.DOWNSCALE
	}

	get prefersLargerImage() {
		return this.isUpscale || this.isContain
	}

	resetMetadata() {
		this.fitType = DEFAULT_VALUE.FIT_TYPE
		this.alignmentType = DEFAULT_VALUE.ALIGNMENT_TYPE
		this.background = DEFAULT_VALUE.BACKGROUND_COLOR_RGB
		this.A.resetMetadata()
		this.B.resetMetadata()
	}

	async toggleOrientation({
		shouldSwap = false,
		shouldRotate = false
	}: ToggleOrientationOps) {
		if (shouldSwap) await this.swap()

		if (shouldRotate) {
			const ccw = xor(shouldSwap, this.isVertical)

			this.A.rotate(ccw)
			this.B.rotate(ccw)
		}

		this.isVertical = !this.isVertical
	}

	async uploadImage(
		{
			pathOrBuffer,
			format,
			shouldReplace,
			side
		}: UploadImageOptions,
		webContents?: WebContents
	) {
		if (!pathOrBuffer && webContents) {      
			const { canceled, filePaths } = await selectImageDialog(webContents, 1)

			if (canceled || arrayIsNullOrEmpty(filePaths)) return

			pathOrBuffer = filePaths[0]
		} else if (!pathOrBuffer) {
			throw new Error(ERROR_MSG.WEB_CONTENTS_REQUIRED)
		}

		if (!shouldReplace && side === SIDE.A && this.A.isLoaded && !this.B.isLoaded) {
			await this.B.uploadImage(pathOrBuffer, format)
			return this.swap()
		}

		return this[side].uploadImage(pathOrBuffer, format)
	}

	async uploadImages(imagePaths: string[] | undefined, webContents: WebContents) {
		if (!imagePaths || imagePaths.length === 0) {
			const { canceled, filePaths } = await selectImageDialog(webContents, 2)

			if (canceled || !filePaths || filePaths.length === 0) return

			imagePaths = filePaths
		}

		await Promise.all([
			this.A.uploadImage(imagePaths[0]),
			imagePaths.length === 2 ? this.B.uploadImage(imagePaths[1]) : Promise.resolve()
		])
	}

	async removeImage({ side }: SideOption) {
		const shouldShiftBToA = side === SIDE.A && !!this.B.srcPath
			
		if (shouldShiftBToA) await this.swap()

		await this[shouldShiftBToA ? SIDE.B : side].removeImage()
	}

	async removeBothImages() {
		await emptyUploadDirectory()

		this.resetMetadata()
	}

	async swap() {
		if (!this.A.srcPath || !this.B.srcPath) return
		
		const extA = path.extname(this.A.srcPath)
		const tempFilename = path.join(UPLOADS_PATH, `${SIDE.A}_TEMP${extA}`)
		const newSrcPathA = path.join(UPLOADS_PATH, `${SIDE.A}${path.extname(this.B.srcPath)}`)
		const newSrcPathB = path.join(UPLOADS_PATH, `${SIDE.B}${extA}`)

		await fsp.rename(this.A.srcPath, tempFilename)
		await fsp.rename(this.B.srcPath, newSrcPathA)
		await fsp.rename(tempFilename, newSrcPathB)

		swapPropertiesMutative<ImageUploadData>(this.A, this.B, 'originalPath', 'angle', 'flip', 'flop')

		this.A.srcPath = newSrcPathA
		this.B.srcPath = newSrcPathB
	}

	rotateImage({ side, ccw }: RotateOptions) {
		this[side].rotate(ccw)
	}

	flipImage({ side }: SideOption) {
		this[side].toggleFlip()
	}

	flopImage({ side }: SideOption) {
		this[side].toggleFlop()
	}

	adjustStitch({ cropImageAValue, cropImageBValue }: AdjustStitchOpts) {
		this.A.crop = cropImageAValue
		this.B.crop = cropImageBValue
	}

	async result(opts: StitchOptions): Promise<StitchResultRaw> {
		if (this.A.isLoaded && this.B.isLoaded) {
			return stitchImages(this, opts)
		} else if (this.A.isLoaded) {
			return renderSingleImage(this.A, opts)
		}

		return {
			imageAFormat: DEFAULT_VALUE.FORMAT,
			hasSizeDifference: false
		}
	}

	async getPreviewState(): Promise<StitchResult> {
		const { result, hasSizeDifference, imageAFormat } = await this.result({
			isPreview: true,
			maxWidth: this.previewMaxWidth,
			maxHeight: this.previewMaxHeight
		})

		return {
			base64: result ? await convertBufferToBase64(result, PREVIEW_IMAGE_FORMAT) : void 0,
			isImageALoaded: this.A.isLoaded,
			isImageBLoaded: this.B.isLoaded,
			isVertical: this.isVertical,
			isImageASideways: this.A.isSideways,
			isImageBSideways: this.B.isSideways,
			fitType: this.fitType,
			hasSizeDifference,
			imageAFormat: getImageAFormat(imageAFormat),
			imageAHasOriginal: this.A.hasOriginal,
			imageBHasOriginal: this.B.hasOriginal
		}
	}

	async flatten(format: keyof FormatEnum) {
		const { result } = await this.result({ format })

		await this.removeBothImages()
		await this.uploadImage({
			side: SIDE.A,
			pathOrBuffer: result,
			format
		})

	}

	async save(webContents: WebContents, saveOpts: SaveOptions) {
		const { canceled, filePath: imagePath } = await saveImage(webContents, this, saveOpts)

		if (canceled || !imagePath) return

		switch (saveOpts.postSaveAction) {
			case POST_SAVE_ACTION.LOAD_RESULT:
				await this.removeBothImages()
				await this.uploadImage({
					pathOrBuffer: imagePath,
					side: SIDE.A
				})
				break
			case POST_SAVE_ACTION.CLEAR_BOTH:
				await this.removeBothImages()
				break
			case POST_SAVE_ACTION.CLEAR_A:
				await this.removeImage({ side: SIDE.A })
				break
			case POST_SAVE_ACTION.CLEAR_B:
				await this.removeImage({ side: SIDE.B })
				break
			default:
				return
		}
	}
}
