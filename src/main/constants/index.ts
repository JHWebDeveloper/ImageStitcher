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
