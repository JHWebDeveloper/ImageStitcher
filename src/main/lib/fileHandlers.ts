import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { app, BrowserWindow, dialog, type OpenDialogOptions, type SaveDialogReturnValue, type WebContents } from 'electron'
import type { FormatEnum } from 'sharp'

import { DEFAULT_VALUE, ERROR_MSG, IMAGE_FILTER, SAVE_TYPE, UPLOADS_PATH } from '../constants'
import type { SaveOptions } from '../types'

import type { ImageStitchData, ImageUploadData } from './uploadImages'

interface ReplaceImageOpts {
	format: keyof FormatEnum
	originalFilePath: string
	result: Buffer<ArrayBufferLike>
	shouldWarn: boolean
}

interface SaveImageWithDialogOpts {
	buffer: Buffer<ArrayBufferLike>
	format: keyof FormatEnum
	imageStitchData: ImageStitchData
	webContents: WebContents | null
}

interface DeleteImageAfterSaveOpts {
	imageData: ImageUploadData
	newFilePath: string
	shouldDelete: boolean
}

export async function selectImageDialog(
	webContents: WebContents,
	maxSelections: 1 | 2 = 1
) {
	const browserWindow = BrowserWindow.fromWebContents(webContents)

	if (!browserWindow) return {
		canceled: true,
		filePaths: []
	}

	const properties: OpenDialogOptions['properties'] = [ 'openFile', 'createDirectory' ]

	if (maxSelections === 2) properties.push('multiSelections')

	return dialog.showOpenDialog(browserWindow, {
		filters: [ IMAGE_FILTER ],
		properties
	})
}

export async function emptyUploadDirectory() {
	const fileNames = await fsp.readdir(UPLOADS_PATH)

	if (!fileNames.length) return

	await Promise.all(fileNames.map(filename => fsp.unlink(path.join(UPLOADS_PATH, filename))))
}

async function warnBeforeOverwriting(originalFilePath: string) {
	const { response } = await dialog.showMessageBox({
		message: `Overwrite ${path.basename(originalFilePath)}?`,
		buttons: [ 'Cancel', 'OK' ]
	})

	return !!response
}

export async function replaceImage({
	format,
	originalFilePath,
	result,
	shouldWarn
}: ReplaceImageOpts): Promise<SaveDialogReturnValue> {
	if (shouldWarn && !(await warnBeforeOverwriting(originalFilePath))) {
		return { canceled: true, filePath: '' }
	}

	const { dir, name } = path.parse(originalFilePath)

	const filePath = path.join(dir, `${name}.${format}`)

	await fsp.unlink(originalFilePath)
	await fsp.writeFile(filePath, result)

	return { canceled: false, filePath }
}

export async function deleteImageAfterSave({
	imageData,
	newFilePath,
	shouldDelete
}: DeleteImageAfterSaveOpts) {
	const { originalPath } = imageData

	if (!shouldDelete || !originalPath || originalPath === newFilePath) return

	imageData.originalPath = null

	return fsp.unlink(originalPath)
}

function createDefaultPath(
	originalPathA: string | null,
	originalPathB: string | null,
	format: keyof FormatEnum
) {
	if (originalPathA) {
		return path.join(path.dirname(originalPathA), `${path.parse(originalPathA).name}${originalPathB ? `_${path.parse(originalPathB).name}` : ''}.${format}`)
	}

	return path.join(app.getPath('pictures'), `untitled.${format}`)
}

async function saveImageWithDialog({
	buffer,
	format,
	imageStitchData,
	webContents
}: SaveImageWithDialogOpts) {
	if (!webContents) throw new Error(ERROR_MSG.MISSING_BROWSER_WINDOW)

	const browserWindow = BrowserWindow.fromWebContents(webContents)

	if (!browserWindow) return {
		canceled: true,
		filePath: ''
	}

	const result = await dialog.showSaveDialog(browserWindow, {
		defaultPath: createDefaultPath(
			imageStitchData.A.originalPath,
			imageStitchData.B.originalPath,
			format
		),
		properties: [ 'createDirectory' ]
	})

	if (result.canceled) return result

	await fsp.writeFile(result.filePath, buffer)

	return result
}

export async function saveImage(
	webContents: WebContents | null,
	imageStitchData: ImageStitchData,
	{
		deleteA,
		deleteB,
		saveType,
		shouldWarn,
		format = DEFAULT_VALUE.FORMAT
	}: SaveOptions
) {
	const { result } = await imageStitchData.result({ format })

	if (!result || (typeof result === 'string')) throw new Error(ERROR_MSG.NO_IMAGE_DATA)

	const isReplaceA = saveType === SAVE_TYPE.REPLACE_A
	const isReplaceB = saveType === SAVE_TYPE.REPLACE_B
	const isNewFile = saveType === SAVE_TYPE.NEW_FILE
	let fileData: SaveDialogReturnValue

	if (isReplaceA && imageStitchData.A.originalPath) {
		fileData = await replaceImage({
			originalFilePath: imageStitchData.A.originalPath,
			format,
			result,
			shouldWarn
		})
	} else if (isReplaceB && imageStitchData.B.originalPath) {
		fileData = await replaceImage({
			originalFilePath: imageStitchData.B.originalPath,
			format,
			result,
			shouldWarn
		})
	} else {
		fileData = await saveImageWithDialog({
			buffer: result,
			format,
			imageStitchData,
			webContents
		})
	}

	if (fileData.canceled || !fileData.filePath) return fileData

	const shouldDeleteA = deleteA && imageStitchData.A.hasOriginal && (isReplaceB || isNewFile)
	const shouldDeleteB = deleteB && imageStitchData.B.hasOriginal && (isReplaceA || isNewFile)

	if (!shouldDeleteA && !shouldDeleteB) return fileData

	await Promise.all([
		deleteImageAfterSave({
			imageData: imageStitchData.A,
			newFilePath: fileData.filePath,
			shouldDelete: shouldDeleteA
		}),
		deleteImageAfterSave({
			imageData: imageStitchData.B,
			newFilePath: fileData.filePath,
			shouldDelete: shouldDeleteB
		})
	])

	return fileData
}
