import React from 'react'

import { DEFAULT_VALUE } from '../../constants'
import { useElectronAPI, useStateCallback } from '../../hooks'

import NumberInput from '../utility_components/NumberInput'

export default function BackgroundOpacityInput() {
	const { setBackgroundOpacity } = useElectronAPI()
	const [ bgOpacity, setBgOpacity ] = useStateCallback<number>(DEFAULT_VALUE.BACKGROUND_OPACITY, setBackgroundOpacity)

	return (
		<NumberInput
			value={bgOpacity}
			defaultValue={DEFAULT_VALUE.BACKGROUND_OPACITY}
			min={0}
			max={100}
			onChange={setBgOpacity} />
	)
}
