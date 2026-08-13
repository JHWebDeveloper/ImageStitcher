import React, { type MouseEvent, useEffectEvent, useId, useRef } from 'react'

import type { SliderThumbProps, StartDrag } from '../../types'
import { assertsIsDOMRect, arrayIsNullOrEmpty } from '../../utilities'

import SliderThumb from './SliderThumb'
import ToggleComponent from './ToggleComponent'
import SliderMarkers from './SliderMarkers'

interface SliderThumbConig extends Omit<SliderThumbProps, 'width' | 'alignment'> {}

interface MiddleThumbConfig extends Pick<SliderThumbConig, 'title'> {
	onChange: (value: [ number, number ]) => void
}

interface Props {
	min?: number
	max?: number
	leftThumb: SliderThumbConig
	rightThumb: SliderThumbConig
	middleThumb?: MiddleThumbConfig
	step?: number
	microStep?: number
	markers?: number[]
	title?: string
	middleThumbTitle?: string
}

interface StartDragRef {
	startDrag: StartDrag
	isDragging: boolean
}

export default function SliderDouble({
	min = 0,
	max = 100,
	leftThumb,
	rightThumb,
	middleThumb = {
		onChange: v => {
			leftThumb.onChange(v[0])
			rightThumb.onChange(v[1])
		}
	},
	step = 1,
	microStep = 0.5,
	markers = [],
	title
}: Props) {
	const leftRef = useRef<StartDragRef>(null)
	const rightRef = useRef<StartDragRef>(null)
	const trackRef = useRef<HTMLSpanElement>(null)
	const thumbId = useId()

	const leftId = `${thumbId}_l`
	const rightId = `${thumbId}_r`
	const middleId = `${thumbId}_m`
	const range = max - min
	const selectedRange = Math.min(rightThumb.value, max) - Math.max(leftThumb.value, min)
	const width = selectedRange / range * 100
	const midPoint = leftThumb.value + selectedRange / 2

	leftThumb.min ??= min
	leftThumb.max ??= max
	rightThumb.min ??= min
	rightThumb.max ??= max

	const setBoth = (newValue: number) => {
		middleThumb.onChange([
			newValue,
			newValue + selectedRange
		])
	}

	const autoCenter = () => {
		setBoth(range / 2 - selectedRange / 2)
	}

	const jumpToPosition = useEffectEvent((e: MouseEvent<HTMLSpanElement>) => {
		if (e.target !== e.currentTarget) return false

		const track = trackRef.current?.getBoundingClientRect()

		assertsIsDOMRect(track)

		const mousePos = Math.round((e.clientX - track.left) / track.width * range + min)
		const midPoint = leftThumb.value + selectedRange / 2

		if (mousePos <= midPoint) {
			leftThumb.onChange(mousePos)
			leftRef.current?.startDrag(e, 0, document.getElementById(leftId), track)
		} else {
			rightThumb.onChange(mousePos)
			rightRef.current?.startDrag(e, 0, document.getElementById(rightId), track)
		}
	})

	const commonProps = { range, step, microStep }

	return (
		<>
			<span
				className="slider"
				title={title}
				aria-label={title}>
				<span
					className="slider-track"
					ref={trackRef}
					onMouseDown={jumpToPosition}>
					<SliderThumb
						sliderId={leftId}
						thumbRef={leftRef}
						value={leftThumb.value}
						min={leftThumb.min}
						max={Math.min(leftThumb.max, midPoint)}
						title={leftThumb.title}
						alignment="right"
						onChange={leftThumb.onChange}
						trackRef={trackRef}
						{...commonProps} />
					<SliderThumb
						sliderId={middleId}
						value={leftThumb.value}
						min={Math.max(leftThumb.min, rightThumb.min - selectedRange)}
						max={Math.min(leftThumb.max, rightThumb.max - selectedRange)}
						title={middleThumb.title}
						width={width}
						alignment="left"
						onChange={setBoth}
						onDoubleClick={autoCenter}
						trackRef={trackRef}
						{...commonProps} />
					<SliderThumb
						sliderId={rightId}
						thumbRef={rightRef}
						value={rightThumb.value}
						min={Math.max(rightThumb.min, midPoint)}
						max={rightThumb.max}
						sliderMin={min}
						title={rightThumb.title}
						alignment="left"
						onChange={rightThumb.onChange}
						trackRef={trackRef}
						{...commonProps} />
				</span>
				<ToggleComponent shouldShow={!arrayIsNullOrEmpty(markers)}>
					<SliderMarkers
						markers={markers}
						min={min}
						range={range} />
				</ToggleComponent>
			</span>
		</>
	)
}
