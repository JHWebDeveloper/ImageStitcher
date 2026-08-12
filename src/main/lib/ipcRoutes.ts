import { ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

import { CHANNEL, ERROR_MSG } from '../constants'
import type { IpcChannel, PossiblePromise, SafeResponse } from '../types'

import type { ImageStitchData } from './uploadImages'

function setListener<K extends keyof IpcChannel>(
  channel: K,
  callback: (evt: IpcMainEvent, opts: IpcChannel[K]['payload']) => void
) {
  ipcMain.on(channel, callback)
}

function setHandler<K extends keyof IpcChannel>(
  channel: K,
  callback: (evt: IpcMainInvokeEvent, opts: IpcChannel[K]['payload']) => PossiblePromise<SafeResponse<IpcChannel[K], 'response'>>
) {
  ipcMain.handle(channel, callback)
}

function send<K extends keyof IpcChannel>(
  evt: IpcMainEvent | IpcMainInvokeEvent,
  channel: K,
  payload: IpcChannel[K]['payload']
) {
  evt.sender.send(channel, payload)
}

function sendErrorMessage(evt: IpcMainEvent | IpcMainInvokeEvent, message: string, cause: unknown) {
  console.error(cause)
  send(evt, CHANNEL.DISPLAY_ERROR_MESSAGE, new Error(message, { cause }))
}

export function setIpcRoutes(imageStitcher: ImageStitchData) {  
  async function sendStitchResult(evt: IpcMainEvent | IpcMainInvokeEvent) {
    try {
      send(evt, CHANNEL.DISPLAY_STITCH_RESULT, {
        result: await imageStitcher.getPreviewState(),
        timestamp: Date.now()
      })
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.DISPLAY_STITCH_RESULT, err)
    }
  }

  setHandler(CHANNEL.UPLOAD_IMAGE, async (evt, opts) => {
    try {
      await imageStitcher.uploadImage(opts, evt.sender)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.UPLOAD_IMAGE, err)
    }
    
    await sendStitchResult(evt)
  })

  setHandler(CHANNEL.UPLOAD_IMAGES, async (evt, opts) => {
    try {
      await imageStitcher.uploadImages(opts.imagePaths, evt.sender)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.UPLOAD_IMAGES, err)
    }

    await sendStitchResult(evt)
  })

  setListener(CHANNEL.SET_PREVIEW_BOUNDS, async (evt, { width, height }) => {
    imageStitcher.previewMaxWidth = width
    imageStitcher.previewMaxHeight = height

    if (!imageStitcher.A.isLoaded) return
    
    sendStitchResult(evt)
  })

  setListener(CHANNEL.SWAP_IMAGES, async evt => {
    try {
      await imageStitcher.swap()
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.SWAP_IMAGES, err)
    }

    sendStitchResult(evt)
  })

  setListener(CHANNEL.CLEAR_IMAGE, async (evt, opts) => {
    try {
      await imageStitcher.removeImage(opts)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.CLEAR_IMAGE, err)
    }

    sendStitchResult(evt)
  })

  setListener(CHANNEL.CLEAR_BOTH_IMAGES, async evt => {		
    try {
      await imageStitcher.removeBothImages()
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.CLEAR_BOTH_IMAGES, err)
    }

    sendStitchResult(evt)
  })

  setListener(CHANNEL.TOGGLE_ORIENTATION, async (evt, opts) => {		
    try {
      await imageStitcher.toggleOrientation(opts)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.TOGGLE_ORIENTATION, err)
    }

    sendStitchResult(evt)
  })

  setListener(CHANNEL.ROTATE_IMAGE, async (evt, opts) => {
    imageStitcher.rotateImage(opts)
    sendStitchResult(evt)
  })

  setListener(CHANNEL.TOGGLE_FLIP, async (evt, opts) => {
    imageStitcher.flipImage(opts)
    sendStitchResult(evt)
  })

  setListener(CHANNEL.TOGGLE_FLOP, async (evt, opts) => {
    imageStitcher.flopImage(opts)
    sendStitchResult(evt)
  })

  setListener(CHANNEL.SET_FIT_TYPE, async (evt, { fitType }) => {
    imageStitcher.fitType = fitType
    sendStitchResult(evt)
  })

  setListener(CHANNEL.SET_ALIGNMENT_TYPE, async (evt, { alignmentType }) => {
    imageStitcher.alignmentType = alignmentType
    sendStitchResult(evt)
  })

  setListener(CHANNEL.SET_BACKGROUND_COLOR, async (evt, { backgroundColor }) => {
    imageStitcher.backgroundColor = backgroundColor
    sendStitchResult(evt)
  })

  setListener(CHANNEL.SET_BACKGROUND_OPACITY, async (evt, { backgroundOpacity }) => {
    imageStitcher.backgroundOpacity = backgroundOpacity
    sendStitchResult(evt)
  })

  setListener(CHANNEL.ADJUST_STITCH, async (evt, opts) => {
    imageStitcher.adjustStitch(opts)
    sendStitchResult(evt)
  })

  setHandler(CHANNEL.IS_MERGE_RESULT_READY, () => (
    imageStitcher.B.isLoaded ?? false
  ))

  setListener(CHANNEL.FLATTEN_IMAGE, async (evt, { format }) => {
    try {
      await imageStitcher.flatten(format)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.FLATTEN_IMAGE, err)
    }

    sendStitchResult(evt)
  })

  setListener(CHANNEL.SAVE_IMAGE, async (evt, data) => {
    try {
      await imageStitcher.save(evt.sender, data)
    } catch (err) {
      return sendErrorMessage(evt, ERROR_MSG.SAVE_IMAGES, err)
    }

    sendStitchResult(evt)
  })
}