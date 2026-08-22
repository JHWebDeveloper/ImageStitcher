import React, { createContext, type PropsWithChildren, useEffect, useRef, useState } from 'react'

import { DEFAULT_VALUE } from '../constants'
import { useElectronAPI } from '../hooks'
import { StitchResponse, StitchResult } from '../types'

interface Props extends PropsWithChildren {}

const initState: StitchResult = {
	base64: '',
	isImageALoaded: false,
	isImageBLoaded: false,
	isVertical: DEFAULT_VALUE.IS_VERTICAL,
	isImageASideways: false,
	isImageBSideways: false,
	hasSizeDifference: false,
	fitType: DEFAULT_VALUE.FIT_TYPE,
	imageAFormat: DEFAULT_VALUE.FORMAT,
	imageAHasOriginal: true,
	imageBHasOriginal: true
}

export const ResponseContext = createContext(initState)

export function ResponseContextProvider({ children }: Props) {
	const { setDisplayStitchResponseListener, removeDisplayStitchResponseListener } = useElectronAPI()
	const [ stitchResult, setStitchResponse ] = useState(initState)
	const timestamp = useRef(-Infinity)

	useEffect(() => {
		setDisplayStitchResponseListener((res: StitchResponse) => {
			if (res.result && res.timestamp > timestamp.current) {
				setStitchResponse(res.result)
				timestamp.current = res.timestamp
			}
		})

		return () => {
			removeDisplayStitchResponseListener()
		}
	}, [])

	return (
		<ResponseContext value={stitchResult}>
			{ children }
		</ResponseContext>
	)
}
