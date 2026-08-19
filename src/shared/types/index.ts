import { type FormatEnum } from 'sharp'

import {
	ALIGNMENT_TYPE,
	CHANNEL,
	FIT_TYPE,
	FORMAT,
	POST_SAVE_ACTION,
	SAVE_TYPE,
	SIDE
} from '../constants'

export type AlignmentTypeValue = typeof ALIGNMENT_TYPE[keyof typeof ALIGNMENT_TYPE]
export type FitTypeValue = typeof FIT_TYPE[keyof typeof FIT_TYPE]
export type FormatValue = typeof FORMAT[keyof typeof FORMAT]
export type SaveTypeValue = typeof SAVE_TYPE[keyof typeof SAVE_TYPE]
export type PostSaveAction = typeof POST_SAVE_ACTION[keyof typeof POST_SAVE_ACTION]
export type Side = typeof SIDE[keyof typeof SIDE]

export interface SideOption {
	side: Side
}

export interface UploadImageOptions extends SideOption {
	pathOrBuffer?: string | Buffer<ArrayBufferLike>
	format?: UploadImageOptions['pathOrBuffer'] extends string ? never : keyof FormatEnum
	shouldReplace?: boolean
}

export interface RotateOptions extends SideOption {
	ccw: boolean
}

export interface ToggleOrientationOps {
	shouldRotate?: boolean
	shouldSwap?: boolean
}

export interface SaveOptions {
	format: keyof FormatEnum
	postSaveAction: PostSaveAction
	deleteA: boolean
	deleteB: boolean
	saveType: SaveTypeValue
	shouldWarn: boolean
}

export interface StitchResult {
	base64: string | undefined
	isImageALoaded: boolean
	isImageBLoaded: boolean
	isVertical: boolean
	isImageASideways: boolean
	isImageBSideways: boolean
	hasSizeDifference: boolean
	fitType: FitTypeValue
	imageAFormat: keyof FormatEnum
	imageAHasOriginal: boolean
	imageBHasOriginal: boolean
}

export interface StitchResponse {
	timestamp: number
	result: StitchResult | undefined
}

export interface AdjustStitchOpts {
	cropImageAValue: number
	cropImageBValue: number
}

export interface IpcChannel {
	[CHANNEL.ADJUST_STITCH]: {
		payload: AdjustStitchOpts
	}
	[CHANNEL.CLEAR_BOTH_IMAGES]: never
	[CHANNEL.CLEAR_IMAGE]: {
		payload: SideOption
	}
	[CHANNEL.DISPLAY_ERROR_MESSAGE]: {
		payload: Error
	}
	[CHANNEL.DISPLAY_STITCH_RESULT]: {
		payload: StitchResponse
	}
	[CHANNEL.FLATTEN_IMAGE]: {
		payload: { format: keyof FormatEnum }
	}
	[CHANNEL.IS_MERGE_RESULT_READY]: {
		response: boolean
	}
	[CHANNEL.ROTATE_IMAGE]: {
		payload: RotateOptions
	}
	[CHANNEL.SAVE_IMAGE]: {
		payload: SaveOptions
	}
	[CHANNEL.SET_ALIGNMENT_TYPE]: {
		payload: { alignmentType: AlignmentTypeValue }
	}
	[CHANNEL.SET_BACKGROUND_COLOR]: {
		payload: { backgroundColor: string }
	}
	[CHANNEL.SET_BACKGROUND_OPACITY]: {
		payload: { backgroundOpacity: number }
	}
	[CHANNEL.SET_FIT_TYPE]: {
		payload: { fitType: FitTypeValue }
	}
	[CHANNEL.SET_PREVIEW_BOUNDS]: {
		payload: {
			width: number
			height: number
		}
	}
	[CHANNEL.SWAP_IMAGES]: never
	[CHANNEL.TOGGLE_FLIP]: {
		payload: SideOption
	}
	[CHANNEL.TOGGLE_FLOP]: {
		payload: SideOption
	}
	[CHANNEL.TOGGLE_ORIENTATION]: {
		payload: {
			shouldSwap: boolean
			shouldRotate: boolean
		}
	}
	[CHANNEL.UPLOAD_IMAGE]: {
		payload: UploadImageOptions
	}
	[CHANNEL.UPLOAD_IMAGES]: {
		payload: { imagePaths?: string[] }
	}
}

export type SafeKey<T, K extends PropertyKey> = K extends keyof T ? T[K] : undefined

export type IpcPayload<K extends keyof IpcChannel> = SafeKey<IpcChannel[K], 'payload'>

export type IpcResponse<K extends keyof IpcChannel> = SafeKey<IpcChannel[K], 'response'>

export type ChannelsWithPayload = {
	[K in keyof IpcChannel]: IpcPayload<K> extends undefined ? never : K;
}[keyof IpcChannel]

export type ChannelsWithoutPayload = {
	[K in keyof IpcChannel]: K extends ChannelsWithPayload ? never : K;
}[keyof IpcChannel]

export type PossiblePromise<T> = Promise<T> | T
