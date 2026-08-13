import React, { type ChangeEvent, use } from 'react'

import { DEFAULT_VALUE } from '../../constants'
import { useDebounce, useStateCallback } from '../../hooks'

import { ElectronAPI } from '../../context/ElectronAPIContext'

type InputChangeEvent = ChangeEvent<HTMLInputElement>

export default function BackgroundColorInput() {
	const { setBackgroundColor } = use(ElectronAPI)
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
