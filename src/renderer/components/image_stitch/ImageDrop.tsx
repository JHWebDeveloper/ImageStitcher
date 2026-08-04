import React, { use } from 'react'

import type { DivDragEvent, TempImageName } from '../../types'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { SaveContext } from '../../context/SaveContext'

interface Props {
  side: TempImageName
  label: string
  shouldReplace?: boolean
  allowMultiple?: boolean
  shouldShow?: boolean
}

function onDragOver(e: DivDragEvent) {
  e.currentTarget.classList.add('dragging-over')
}

function onDragLeave(e: DivDragEvent) {
  e.currentTarget.classList.remove('dragging-over')
}

export default function ImageDrop({
  side,
  label,
  shouldReplace = true,
  allowMultiple = false
}: Props) {
  const { isMergeResultReady, saveImage, uploadImage, uploadImages } = use(ElectronAPI)
  const { getSaveOptions, saveOnDrop } = use(SaveContext)

  const uploadImagesOnDrop = async (files: File[]) => {
    try {
      if (allowMultiple && files.length > 1) {
        await uploadImages(files.slice(0, 2))
      } else {
        await uploadImage(side, files[0], shouldReplace)
      }

      if (saveOnDrop && await isMergeResultReady()) saveImage(getSaveOptions())
    } catch {
      return
    }
  }

  const onDrop = (e: DivDragEvent) => {
    e.preventDefault()
    uploadImagesOnDrop(Array.from(e.dataTransfer.files))
    onDragLeave(e)
  }

  return (
    <div
      className="image-drop"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}>
      <p>{ label }</p>
    </div>
  )
}
