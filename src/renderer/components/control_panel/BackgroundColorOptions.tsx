import React, { type ChangeEvent } from 'react'

import { DEFAULT_VALUE } from '../../constants'
import { useDebounce, useElectronAPI, useStateCallback } from '../../hooks'

type InputChangeEvent = ChangeEvent<HTMLInputElement>

export default function BackgroundColorInput() {
	const { setBackgroundColor } = useElectronAPI()
	const [ setBgColorDebounce ] = useDebounce(setBackgroundColor, 60)

	const [ bgColor, setBgColor ] = useStateCallback<string>(DEFAULT_VALUE.BACKGROUND_COLOR_HEX, (newValue, dispatch) => {
		setBgColorDebounce(newValue)
		dispatch(newValue)
	})

	const setBgColorFromEvent = (e: InputChangeEvent) => {
		setBgColor(e.target.value)
	}

	return (
		<input
			type="color"
			value={bgColor}
			onChange={setBgColorFromEvent} />
	)
}
