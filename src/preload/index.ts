import { contextBridge, ipcRenderer, type IpcRendererEvent, webUtils } from 'electron'

import { CHANNEL, NAMESPACE } from './constants'
import type { AdjustStitchOpts, AlignmentTypeValue, FitTypeValue, IpcChannel, SafeResponse, SaveOptions, StitchResponse, TempImageName } from './types'

function send<K extends keyof IpcChannel>(
  channel: K,
  payload: IpcChannel[K]['payload'] = {}
) {
  ipcRenderer.send(channel, payload)
}

function invoke<K extends keyof IpcChannel>(
  channel: K,
  payload: IpcChannel[K]['payload'] = {}
): Promise<SafeResponse<IpcChannel[K], 'response'>> {
  return ipcRenderer.invoke(channel, payload)
}

function setListener<K extends keyof IpcChannel>(
  channel: K,
  callback: (evt: IpcRendererEvent, opts: IpcChannel[K]['payload']) => void
) {
  ipcRenderer.on(channel, callback)
}

function removeAllListeners<K extends keyof IpcChannel>(channel: K) {
  ipcRenderer.removeAllListeners(channel)
}

export const electronAPI = {
  setPreviewBounds(width: number, height: number) {
    send(CHANNEL.SET_PREVIEW_BOUNDS, { width, height })
  },

  uploadImage(
    side: TempImageName,
    file?: File | null,
    shouldReplace?: typeof file extends null ? never : boolean
  ) {
    return invoke(
      CHANNEL.UPLOAD_IMAGE,
      {
        ...file ? { imagePath: webUtils.getPathForFile(file) } : {},
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

  swapImages() {
    send(CHANNEL.SWAP_IMAGES)
  },

  clearImage(side: TempImageName) {
    send(CHANNEL.CLEAR_IMAGE, { side })
  },

  clearBothImages() {
    send(CHANNEL.CLEAR_BOTH_IMAGES)
  },

  toggleOrientation(shouldSwap: boolean, shouldRotate: boolean) {
    send(CHANNEL.TOGGLE_ORIENTATION, { shouldSwap, shouldRotate })
  },

  rotateImage(side: TempImageName, ccw: boolean = false) {
    send(CHANNEL.ROTATE_IMAGE, { side, ccw })
  },

  flipImage(side: TempImageName) {
    send(CHANNEL.TOGGLE_FLIP, { side })
  },

  flopImage(side: TempImageName) {
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

  isMergeResultReady() {
    return invoke(CHANNEL.IS_MERGE_RESULT_READY)
  },

  saveImage(opts: SaveOptions) {
    send(CHANNEL.SAVE_IMAGE, opts)
  },

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

contextBridge.exposeInMainWorld(NAMESPACE, Object.freeze({
	electronAPI: Object.freeze(electronAPI)
}))
