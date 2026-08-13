import path from 'node:path'
import { app, type FileFilter } from 'electron'
import type { FormatEnum } from 'sharp'

export * from '../../shared/constants'

export const IS_MAC = process.platform === 'darwin'

export const IS_DEV = process.env.NODE_ENV === 'development'

export const UPLOADS_PATH = process.env.NODE_ENV === 'development'
	? path.resolve(import.meta.dirname, '..', 'uploads')
	: path.join(app.getPath('appData'), 'image-stitch', 'uploads')

export const PREVIEW_IMAGE_FORMAT: keyof FormatEnum = 'webp'

export const LOSSLESS_IMAGE_FORMAT: keyof FormatEnum = 'png'

export const IMAGE_FILTER = {
	name: 'Images',
	extensions: ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tif', 'tiff', 'webp']
} as const satisfies FileFilter

const ERROR_PREFIX = 'An error occurred while attempting to'

export const ERROR_MSG = {
	CLEAR_IMAGE: `${ERROR_PREFIX} remove an image`,
	CLEAR_BOTH_IMAGES: `${ERROR_PREFIX} remove the images`,
	DISPLAY_STITCH_RESULT: `${ERROR_PREFIX} merge the images`,
	FLATTEN_IMAGE: `${ERROR_PREFIX} flatten the images`,
	MISSING_BROWSER_WINDOW: 'No browser window provided',
	MISSING_SOURCE_FILE: 'Source file not found',
	NO_IMAGE_DATA: 'No image data to save',
	SAVE_IMAGES: `${ERROR_PREFIX} save the image`,
	SWAP_IMAGES: `${ERROR_PREFIX} swap the images`,
	TOGGLE_ORIENTATION: `${ERROR_PREFIX} change the orientation of the images`,
	UNKNOWN_ERROR: 'An unknown error occurred',
	UPLOAD_IMAGE: `${ERROR_PREFIX} upload the image`,
	UPLOAD_IMAGES: `${ERROR_PREFIX} upload multiple images`,
	WEB_CONTENTS_REQUIRED: 'An argument for parameter webContents is required when no image path or buffer is provided',
}
