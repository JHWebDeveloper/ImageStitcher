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
	setPostSaveAction: Dispatch<SetStateAction<PostSaveAction>>
	getSaveOptions: () => SaveOptions
	setSaveType: Dispatch<SetStateAction<SaveTypeValue>>
	toggleDeleteA: UseToggleDispatch
	toggleDeleteB: UseToggleDispatch
	toggleSaveOnDrop: UseToggleDispatch
	toggleShouldWarn: UseToggleDispatch
}

const initSaveOptions = {
	deleteA: DEFAULT_VALUE.DELETE_A,
	deleteB: DEFAULT_VALUE.DELETE_B,
	format: DEFAULT_VALUE.FORMAT,
	postSaveAction: DEFAULT_VALUE.POST_SAVE_ACTION,
	saveType: DEFAULT_VALUE.SAVE_TYPE,
	shouldWarn: DEFAULT_VALUE.SHOULD_WARN
} satisfies SaveOptions

const initState = {
	...initSaveOptions,
	saveOnDrop: DEFAULT_VALUE.SAVE_ON_DROP
} satisfies SaveState

export const SaveContext = createContext<SaveContext>({
	...initState,
	getSaveOptions: () => initSaveOptions,
	setFormat() {},
	setPostSaveAction() {},
	setSaveType() {},
	toggleDeleteA() {},
	toggleDeleteB() {},
	toggleSaveOnDrop() {},
	toggleShouldWarn() {}
})

export function SaveContextProvider({
	imageAFormat,
	isImageBLoaded,
	children
}: Props) {
	const [ deleteA, toggleDeleteA ] = useToggle(initState.deleteA)
	const [ deleteB, toggleDeleteB ] = useToggle(initState.deleteB)
	const [ format, setFormat ] = useState<keyof FormatEnum>(imageAFormat || initState.format)
	const [ postSaveAction, setPostSaveAction ] = useState<PostSaveAction>(initState.postSaveAction)
	const [ saveOnDrop, toggleSaveOnDrop ] = useToggle(initState.saveOnDrop)
	const [ saveType, setSaveType ] = useState<SaveTypeValue>(initState.saveType)
	const [ shouldWarn, toggleShouldWarn ] = useToggle(initState.shouldWarn)

	const getSaveOptions = (): SaveOptions => ({
		deleteA,
		deleteB,
		format,
		postSaveAction,
		saveType,
		shouldWarn
	})

	useEffect(() => {
		if (!isImageBLoaded && format !== imageAFormat) setFormat(imageAFormat)
	}, [imageAFormat, isImageBLoaded])

	return (
		<SaveContext value={{
			deleteA,
			deleteB,
			format,
			postSaveAction,
			saveOnDrop,
			saveType,
			shouldWarn,
			getSaveOptions,
			setFormat,
			setPostSaveAction,
			setSaveType,
			toggleDeleteA,
			toggleDeleteB,
			toggleSaveOnDrop,
			toggleShouldWarn
		}}>
			{ children }
		</SaveContext>
	)
}
