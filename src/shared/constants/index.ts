import type { FormatEnum } from 'sharp'

import { hexToRgb } from '../utilities'

export * as CHANNEL from './channels'

export const NAMESPACE = 'IMAGE_STITCH'

export const SIDE = {
	A: 'A',
	B: 'B'
} as const

export const SAVE_TYPE = {
	REPLACE_A: 'REPLACE_A',
	REPLACE_B: 'REPLACE_B',
	NEW_FILE: 'NEW_FILE'
} as const

export const POST_SAVE_ACTION = {
	CLEAR_BOTH: 'CLEAR_BOTH',
	LOAD_RESULT: 'LOAD_RESULT',
	NONE: 'NONE',
	CLEAR_B: 'CLEAR_B',
	CLEAR_A: 'CLEAR_A'
} as const

export const FIT_TYPE = {
	UPSCALE: 'UPSCALE',
	DOWNSCALE: 'DOWNSCALE',
	COVER: 'COVER',
	CONTAIN: 'CONTAIN'
} as const

export const ALIGNMENT_TYPE = {
	START: 'START',
	MIDDLE: 'MIDDLE',
	END: 'END'
} as const

export const FORMAT: Record<PropertyKey, keyof FormatEnum> = {
	JPEG: 'jpeg',
	PNG: 'png',
	TIFF: 'tiff',
	WEBP: 'webp'
} as const

const BACKGROUND_COLOR_HEX = '#000000'
const BACKGROUND_OPACITY = 0

export const DEFAULT_VALUE = {
	ALIGNMENT_TYPE: ALIGNMENT_TYPE.MIDDLE,
	ANGLE: 0,
	BACKGROUND_COLOR_HEX,
	BACKGROUND_COLOR_RGB: {
		...hexToRgb(BACKGROUND_COLOR_HEX),
		alpha: BACKGROUND_OPACITY / 100
	},
	BACKGROUND_OPACITY,
	CROP_VALUES: [ 100, 100 ] satisfies [number, number],
	DELETE_A: true,
	DELETE_B: true,
	FIT_TYPE: FIT_TYPE.UPSCALE,
	FLIP: false,
	FLOP: false,
	FORMAT: FORMAT.PNG,
	IS_VERTICAL: false,
	LEFT_ALIGNED: false,
	POST_SAVE_ACTION: POST_SAVE_ACTION.NONE,
	SAVE_ON_DROP: true,
	SAVE_TYPE: SAVE_TYPE.REPLACE_A,
	SHOULD_WARN: true
}
