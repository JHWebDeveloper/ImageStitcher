import { ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

import { CHANNEL } from '../constants'
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

function sendErrorMessage(evt: IpcMainEvent | IpcMainInvokeEvent, err: unknown) {
  let _err: Error
  
  if (Error.isError(err)) {
    _err = err
  } else if (typeof err === 'string') {
    _err = new Error(err)
  } else {
    _err = new Error('An unknown error occurred', { cause: err })
  }

  console.error(_err)

  send(evt, CHANNEL.DISPLAY_ERROR_MESSAGE, _err)
}

export function setIpcRoutes(imageStitcher: ImageStitchData) {  
  async function sendStitchResult(evt: IpcMainEvent | IpcMainInvokeEvent) {
    try {
      send(evt, CHANNEL.DISPLAY_STITCH_RESULT, {
        result: await imageStitcher.getPreviewState(),
        timestamp: Date.now()
      })
    } catch (cause) {
      throw new Error('An error ocurred while attempting to merge images', { cause })
    }
  }

  setListener(CHANNEL.SET_PREVIEW_BOUNDS, async (evt, { width, height }) => {
    imageStitcher.previewMaxWidth = width
    imageStitcher.previewMaxHeight = height

    if (!imageStitcher.A.isLoaded) return
    
    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setHandler(CHANNEL.UPLOAD_IMAGE, async (evt, opts) => {
    try {
      await imageStitcher.uploadImage(opts, evt.sender)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setHandler(CHANNEL.UPLOAD_IMAGES, async (evt, opts) => {
    try {
      await imageStitcher.uploadImages(opts.imagePaths, evt.sender)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SWAP_IMAGES, async evt => {
    try {
      await imageStitcher.swap()
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.CLEAR_IMAGE, async (evt, opts) => {
    try {
      await imageStitcher.removeImage(opts)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.CLEAR_BOTH_IMAGES, async evt => {		
    try {
      await imageStitcher.removeBothImages()
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.TOGGLE_ORIENTATION, async (evt, opts) => {		
    try {
      await imageStitcher.toggleOrientation(opts)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.ROTATE_IMAGE, async (evt, opts) => {
    imageStitcher.rotateImage(opts)

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.TOGGLE_FLIP, async (evt, opts) => {
    imageStitcher.flipImage(opts)

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.TOGGLE_FLOP, async (evt, opts) => {
    imageStitcher.flopImage(opts)

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SET_FIT_TYPE, async (evt, { fitType }) => {
    if (imageStitcher) imageStitcher.fitType = fitType

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SET_ALIGNMENT_TYPE, async (evt, { alignmentType }) => {
    if (imageStitcher) imageStitcher.alignmentType = alignmentType

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SET_BACKGROUND_COLOR, async (evt, { backgroundColor }) => {
    if (imageStitcher) imageStitcher.backgroundColor = backgroundColor

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SET_BACKGROUND_OPACITY, async (evt, { backgroundOpacity }) => {
    if (imageStitcher) imageStitcher.backgroundOpacity = backgroundOpacity

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.ADJUST_STITCH, async (evt, opts) => {
    imageStitcher.adjustStitch(opts)

    try {
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setHandler(CHANNEL.IS_MERGE_RESULT_READY, () => (
    imageStitcher.B.isLoaded ?? false
  ))

  setListener(CHANNEL.FLATTEN_IMAGE, async (evt, { format }) => {
    try {
      await imageStitcher.flatten(format)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })

  setListener(CHANNEL.SAVE_IMAGE, async (evt, data) => {
    try {
      await imageStitcher.save(evt.sender, data)
      await sendStitchResult(evt)
    } catch (err) {
      sendErrorMessage(evt, err)
    }
  })
}