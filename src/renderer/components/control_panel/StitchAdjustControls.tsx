import React, { use, useEffect, useRef, useState } from 'react'

import { DEFAULT_VALUE, LABEL } from '../../constants'
import { useToggle, useThrottle } from '../../hooks'
import { clamp, round } from '../../utilities'

import { ElectronAPI } from '../../context/ElectronAPIContext'

import Slider from '../utility_components/SliderDouble'
import NumberInput from '../utility_components/NumberInput'
import IconButton from '../utility_components/IconButton'

interface Props {
	isVertical: boolean
}

const MIN = 0
const MAX = 100
const SLIDER_MAX = MAX * 2

const useCaptureLRValues = (): [
	number | null,
	number | null,
	(left: number, right: number) => void,
	() => void
] => {
	const capturedL = useRef<number>(null)
	const capturedR  = useRef<number>(null)

	const setCapturedLR = (left: number, right: number) => {
		capturedL.current ??= left
		capturedR.current ??= right
	}

	const resetCapturedLR = () => {
		capturedL.current = null
		capturedR.current = null
	}

	return [ 
		capturedL.current,
		capturedR.current,
		setCapturedLR,
		resetCapturedLR
	]
}

export default function StitchAdjustControls({ isVertical }: Props) {
	const { adjustStitch } = use(ElectronAPI)
	const [ [ cropImageAValue, cropImageBValue ], setCropValues ] = useState<[number, number]>(DEFAULT_VALUE.CROP_VALUES)
	const [ capturedL, capturedR, captureLRValues, resetLRValues ] = useCaptureLRValues()
	const [ isLinked, toggleIsLinked ] = useToggle(true)

	const cropImageAValueForInput = round(100 - cropImageAValue)
	const cropImageBValueForInput = round(cropImageBValue - 100)

	const setLeft = (nextLeftValue: number) => {
		setCropValues( ([, prevRightValue ]) => ([
			nextLeftValue,
			prevRightValue
		]))
	}

	const setLeftComplimentRight = (nextLeftValue: number) => {
		setCropValues(([ prevLeftValue, prevRightValue ]) => {
			captureLRValues(prevLeftValue, prevRightValue)
			
			return [
				nextLeftValue,
				clamp((capturedR ?? prevRightValue) - nextLeftValue + (capturedL ?? prevLeftValue), MAX, SLIDER_MAX)
			]
		})
	}

	const setRight = (nextRightValue: number) => {
		setCropValues(([ prevLeftValue ]) => ([
			prevLeftValue,
			nextRightValue
		]))
	}

	const setRightComplimentLeft = (nextRightValue: number) => {
		setCropValues(([ prevLeftValue, prevRightValue ]) => {
			captureLRValues(prevLeftValue, prevRightValue)

			return [
				clamp((capturedL ?? prevLeftValue) - nextRightValue + (capturedR ?? prevRightValue), MIN, MAX),
				nextRightValue
			]
		})
	}

	const [ setLeftAction, setRightAction ] = isLinked ? [ setLeftComplimentRight, setRightComplimentLeft ] : [ setLeft, setRight ]

	const setLeftFromInput = (nextLeftValue: number) => {
		setLeftAction(100 - nextLeftValue)
	}

	const setRightFromInput = (nextRightValue: number) => {
		setRightAction(nextRightValue + 100)
	}

	const resetCropValues = () => {
		setCropValues(DEFAULT_VALUE.CROP_VALUES)
	}

	const [ cropImage ] = useThrottle((imgA: number, imgB: number) => {
		adjustStitch({
			cropImageAValue: imgA,
			cropImageBValue: imgB
		})
	}, 20)

	useEffect(() => {
		cropImage(cropImageAValueForInput, cropImageBValueForInput)
	}, [ cropImageAValueForInput, cropImageBValueForInput ])

	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener('mouseup', resetLRValues, {
			signal: controller.signal
		})

		return () => {
			controller.abort()
		}
	}, [])

	return (
		<div className="crop-control">
			<IconButton
				icon={`link${isLinked ? '' : '_off'}`}
				title={isLinked ? LABEL.LINK_CROP_SLIDERS : LABEL.UNLINK_CROP_SLIDERS}
				onClick={() => toggleIsLinked()} />
			<NumberInput
				name="slider-input"
				value={cropImageAValueForInput}
				defaultValue={MIN}
				onChange={setLeftFromInput}
				allowNegativeValues={false} />
			<Slider
				min={MIN}
				max={SLIDER_MAX}
				leftThumb={{
					value: cropImageAValue,
					max: MAX,
					onChange: setLeftAction
				}}
				middleThumb={{
					onChange: setCropValues
				}}
				rightThumb={{
					value: cropImageBValue,
					min: MAX,
					onChange: setRightAction
				}}
				markers={[MAX]} />
			<NumberInput
				name="slider-input"
				value={cropImageBValueForInput}
				defaultValue={MIN}
				onChange={setRightFromInput}
				allowNegativeValues={false} />
			<IconButton
				icon="compress"
				iconAngle={isVertical ? 0 : 90}
				onClick={resetCropValues} />
		</div>
	)
}
