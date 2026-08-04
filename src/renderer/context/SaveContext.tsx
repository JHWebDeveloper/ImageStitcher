import React, { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useEffect, useState } from 'react'
import type { FormatEnum } from 'sharp'

import { DEFAULT_VALUE } from '../constants'
import { useToggle } from '../hooks'
import type { UseToggleDispatch, SaveOptions, SaveTypeValue, PostSaveAction } from '../types'

interface Props extends PropsWithChildren {
  imageAFormat: keyof FormatEnum
  isImageBLoaded: boolean
}

interface SaveState extends SaveOptions {
  saveOnDrop: boolean
}

interface SaveContext extends SaveState {
  setFormat: Dispatch<SetStateAction<keyof FormatEnum>>
  setSaveType: Dispatch<SetStateAction<SaveTypeValue>>
  setPostSaveAction: Dispatch<SetStateAction<PostSaveAction>>
  toggleSaveOnDrop: UseToggleDispatch
  toggleDeleteA: UseToggleDispatch
  toggleDeleteB: UseToggleDispatch
  getSaveOptions: () => SaveOptions
}

const initSaveOptions = {
  format: DEFAULT_VALUE.FORMAT,
  saveType: DEFAULT_VALUE.SAVE_TYPE,
  deleteA: DEFAULT_VALUE.DELETE_A,
  deleteB: DEFAULT_VALUE.DELETE_B,
  postSaveAction: DEFAULT_VALUE.POST_SAVE_ACTION,
} satisfies SaveOptions

const initState = {
  ...initSaveOptions,
  saveOnDrop: DEFAULT_VALUE.SAVE_ON_DROP
} satisfies SaveState

export const SaveContext = createContext<SaveContext>({
  ...initState,
  setFormat() {},
  setSaveType() {},
  setPostSaveAction() {},
  toggleSaveOnDrop() {},
  toggleDeleteA() {},
  toggleDeleteB() {},
  getSaveOptions: () => initSaveOptions
})

export function SaveContextProvider({
  imageAFormat,
  isImageBLoaded,
  children
}: Props) {
  const [ saveOnDrop, toggleSaveOnDrop ] = useToggle(initState.saveOnDrop)
  const [ format, setFormat ] = useState<keyof FormatEnum>(imageAFormat || initState.format)
  const [ saveType, setSaveType ] = useState<SaveTypeValue>(initState.saveType)
  const [ postSaveAction, setPostSaveAction ] = useState<PostSaveAction>(initState.postSaveAction)
  const [ deleteA, toggleDeleteA ] = useToggle(initState.deleteA)
  const [ deleteB, toggleDeleteB ] = useToggle(initState.deleteB)

  const getSaveOptions = (): SaveOptions => ({
    format,
    saveType,
    deleteA,
    deleteB,
    postSaveAction
  })

  useEffect(() => {
    if (!isImageBLoaded && format !== imageAFormat) setFormat(imageAFormat)
  }, [imageAFormat, isImageBLoaded])

  return (
    <SaveContext value={{
      saveOnDrop,
      format,
      saveType,
      deleteA,
      deleteB,
      postSaveAction,
      setFormat,
      setSaveType,
      setPostSaveAction,
      toggleSaveOnDrop,
      toggleDeleteA,
      toggleDeleteB,
      getSaveOptions
    }}>
      { children }
    </SaveContext>
  )
}
