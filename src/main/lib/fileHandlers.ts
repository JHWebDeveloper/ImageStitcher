import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { app, BrowserWindow, dialog, type OpenDialogOptions, type SaveDialogReturnValue, type WebContents } from 'electron'
import type { FormatEnum } from 'sharp'

import { DEFAULT_VALUE, IMAGE_FILTER, SAVE_TYPE, UPLOADS_PATH } from '../constants'
import type { SaveOptions } from '../types'

import type { ImageStitchData, ImageUploadData } from './uploadImages'

export async function selectImageDialog(
  webContents: WebContents,
  maxSelections: 1 | 2 = 1
) {
  const browserWindow = BrowserWindow.fromWebContents(webContents)

  if (!browserWindow) return {
    canceled: true,
    filePaths: []
  }

  const properties: OpenDialogOptions['properties'] = ['openFile', 'createDirectory']

  if (maxSelections === 2) properties.push('multiSelections')

  return dialog.showOpenDialog(browserWindow, {
    filters: [IMAGE_FILTER],
    properties
  })
}

export async function emptyUploadDirectory() {
  const fileNames = await fsp.readdir(UPLOADS_PATH)

  if (!fileNames.length) return

  await Promise.all(fileNames.map(filename => fsp.unlink(path.join(UPLOADS_PATH, filename))))
}

export async function replaceImage(
  originalFilePath: string,
  format: keyof FormatEnum,
  result: Buffer<ArrayBufferLike>
): Promise<SaveDialogReturnValue> {
  const { response } = await dialog.showMessageBox({
    message: `Overwrite ${path.basename(originalFilePath)}?`,
    buttons: ['Cancel', 'OK']
  })

  if (!response) {
    return { canceled: true, filePath: '' }
  }

  const { dir, name } = path.parse(originalFilePath)

  const filePath = path.join(dir, `${name}.${format}`)

  await fsp.unlink(originalFilePath)
  await fsp.writeFile(filePath, result)

  return { canceled: false, filePath }
}

export async function deleteImageAfterSave(
  shouldDelete: boolean,
  imageData: ImageUploadData,
  newFilePath: string
) {
  const { originalPath } = imageData

  if (!shouldDelete || !originalPath || originalPath === newFilePath) return

  imageData.originalPath = null
  
  return await fsp.unlink(originalPath)
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

async function saveImageWithDialog(
  webContents: WebContents | null,
  imageStitchData: ImageStitchData,
  format: keyof FormatEnum,
  buffer: Buffer<ArrayBufferLike>
) {
  if (!webContents) throw new Error('No browser window provided')

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
    properties: ['createDirectory']
  })

  if (result.canceled) return result

  await fsp.writeFile(result.filePath, buffer)

  return result
}

export async function saveImage(
  webContents: WebContents | null,
  imageStitchData: ImageStitchData,
  {
    saveType,
    deleteA,
    deleteB,
    format = DEFAULT_VALUE.FORMAT
  }: SaveOptions
) {
  const { result } = await imageStitchData.result({ format })
  
  if (!result || (typeof result === 'string')) throw new Error('No image data to save')

  const isReplaceA = saveType === SAVE_TYPE.REPLACE_A
  const isReplaceB = saveType === SAVE_TYPE.REPLACE_B
  const isNewFile = saveType === SAVE_TYPE.NEW_FILE
  let fileData: SaveDialogReturnValue

  if (isReplaceA && imageStitchData.A.originalPath) {
    fileData = await replaceImage(imageStitchData.A.originalPath, format, result)
  } else if (isReplaceB && imageStitchData.B.originalPath) {
    fileData = await replaceImage(imageStitchData.B.originalPath, format, result)
  } else {
    fileData = await saveImageWithDialog(webContents, imageStitchData, format, result)
  }

  if (fileData.canceled || !fileData.filePath) return fileData

  const shouldDeleteA = deleteA && (isReplaceB || isNewFile) && imageStitchData.A.hasOriginal
  const shouldDeleteB = deleteB && (isReplaceA || isNewFile) && imageStitchData.B.hasOriginal

  if (!shouldDeleteA && !shouldDeleteB) return fileData

  await Promise.all([
    deleteImageAfterSave(shouldDeleteA, imageStitchData.A, fileData.filePath),
    deleteImageAfterSave(shouldDeleteB, imageStitchData.B, fileData.filePath)
  ])

  return fileData
}
