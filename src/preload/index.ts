import { contextBridge, ipcRenderer, type IpcRendererEvent, webUtils } from 'electron'

import { CHANNEL, NAMESPACE } from './constants'
import type { AdjustStitchOpts, AlignmentTypeValue, ChannelsWithPayload, ChannelsWithoutPayload, FitTypeValue, IpcChannel, IpcPayload, IpcResponse, SaveOptions, StitchResponse, Side } from './types'
import { FormatEnum } from 'sharp'

// Overload Signatures
function send<K extends ChannelsWithPayload>(channel: K, payload: IpcChannel[K]['payload']): void
function send<K extends ChannelsWithoutPayload>(channel: K): void

// Implementation Signature
function send<K extends keyof IpcChannel>(
	channel: K,
	payload?: unknown
) {
	ipcRenderer.send(channel, payload)
}

// Overload Signatures
function invoke<K extends ChannelsWithPayload>(channel: K, payload: IpcChannel[K]['payload']): void
function invoke<K extends ChannelsWithoutPayload>(channel: K): void

// Implementation Signature
function invoke<K extends keyof IpcChannel>(
	channel: K,
	payload?: IpcPayload<K>
): Promise<IpcResponse<K>> {
	return ipcRenderer.invoke(channel, payload)
}

function setListener<K extends keyof IpcChannel>(
	channel: K,
	callback: (evt: IpcRendererEvent, res: IpcPayload<K>) => void
) {
	ipcRenderer.on(channel, callback)
}

function removeAllListeners<K extends keyof IpcChannel>(channel: K) {
	ipcRenderer.removeAllListeners(channel)
}

const electronAPI = {
	/* INVOKE */

	uploadImage(
		side: Side,
		file?: File | null,
		shouldReplace?: typeof file extends null ? never : boolean
	) {
		return invoke(
			CHANNEL.UPLOAD_IMAGE,
			{
				pathOrBuffer: file ? webUtils.getPathForFile(file) : void 0,
				side,
				shouldReplace
			}
		)
	},

	uploadImages(files?: File[]) {
		return invoke(
			CHANNEL.UPLOAD_IMAGES,
			files ? {
				imagePaths: files.map(webUtils.getPathForFile)
			} : {}
		)
	},

	isMergeResultReady() {
		return invoke(CHANNEL.IS_MERGE_RESULT_READY)
	},

	/* SEND */

	setPreviewBounds(width: number, height: number) {
		send(CHANNEL.SET_PREVIEW_BOUNDS, { width, height })
	},

	swapImages() {
		send(CHANNEL.SWAP_IMAGES)
	},

	clearImage(side: Side) {
		send(CHANNEL.CLEAR_IMAGE, { side })
	},

	clearBothImages() {
		send(CHANNEL.CLEAR_BOTH_IMAGES)
	},

	toggleOrientation(shouldSwap: boolean, shouldRotate: boolean) {
		send(CHANNEL.TOGGLE_ORIENTATION, { shouldSwap, shouldRotate })
	},

	rotateImage(side: Side, ccw = false) {
		send(CHANNEL.ROTATE_IMAGE, { side, ccw })
	},

	flipImage(side: Side) {
		send(CHANNEL.TOGGLE_FLIP, { side })
	},

	flopImage(side: Side) {
		send(CHANNEL.TOGGLE_FLOP, { side })
	},

	setFitType(fitType: FitTypeValue) {
		send(CHANNEL.SET_FIT_TYPE, { fitType })
	},

	setAlignmentType(alignmentType: AlignmentTypeValue) {
		send(CHANNEL.SET_ALIGNMENT_TYPE, { alignmentType })
	},

	setBackgroundColor(backgroundColor: string) {
		send(CHANNEL.SET_BACKGROUND_COLOR, { backgroundColor })
	},

	setBackgroundOpacity(backgroundOpacity: number) {
		send(CHANNEL.SET_BACKGROUND_OPACITY, { backgroundOpacity })
	},

	adjustStitch(opts: AdjustStitchOpts) {
		send(CHANNEL.ADJUST_STITCH, opts)
	},

	flattenImage(format: keyof FormatEnum) {
		send(CHANNEL.FLATTEN_IMAGE, { format })
	},

	saveImage(opts: SaveOptions) {
		send(CHANNEL.SAVE_IMAGE, opts)
	},

	/* LISTENERS */

	setDisplayStitchResponseListener(callback: (stitchResponse: StitchResponse) => void) {
		setListener(CHANNEL.DISPLAY_STITCH_RESULT, (_, stitchResponse: StitchResponse) => {
			callback(stitchResponse)
		})
	},

	removeDisplayStitchResponseListener() {
		removeAllListeners(CHANNEL.DISPLAY_STITCH_RESULT)
	},

	setErrorListener(callback: (err: Error) => void) {
		setListener(CHANNEL.DISPLAY_ERROR_MESSAGE, (_, err) => {
			callback(err)
		})
	},

	removeErrorListener() {
		removeAllListeners(CHANNEL.DISPLAY_ERROR_MESSAGE)
	}
} as const

export type ElectronAPI = typeof electronAPI

contextBridge.exposeInMainWorld(NAMESPACE, Object.freeze({
	electronAPI: Object.freeze(electronAPI)
}))
