import type { FormatEnum } from 'sharp'

export * from '../../shared/types'

export interface StitchOptions {
	isPreview?: boolean
	format?: keyof FormatEnum
	maxWidth?: number
	maxHeight?: number
}

export interface StitchResultRaw {
	result?: Buffer<ArrayBufferLike>
	hasSizeDifference: boolean
	imageAFormat: keyof FormatEnum
}
