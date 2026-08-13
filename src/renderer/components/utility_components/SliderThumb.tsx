import React, { type KeyboardEvent, type Ref, type RefObject, useEffect, useEffectEvent, useImperativeHandle, useRef } from 'react'

import type { SliderThumbProps, StartDrag, StartDragRef } from '../../types'
import { assertsIsDOMRect, clamp } from '../../utilities'

type MouseEventSpan = React.MouseEvent<HTMLSpanElement>

interface Props extends SliderThumbProps {
	value: number
	min?: number
	max?: number
	range: number
	sliderId: string
	sliderMin?: number
	step?: number
	microStep?: number
	onDoubleClick?: (e: MouseEventSpan) => void
	thumbRef?: Ref<StartDragRef>
	trackRef: RefObject<HTMLElement | null>
}

type GetClickPos = (e: MouseEventSpan, thumb?: HTMLElement | null) => number

function assertsIsHTMLSpanElement(el: unknown): asserts el is typeof HTMLSpanElement {
	if (el instanceof HTMLSpanElement) return
	
	throw new Error('Slider thumb element not captured')
}

function createClickPositionGetter(alignment: string): GetClickPos {
	switch (alignment) {
		case 'left':
			return (e, thumb) => {
				assertsIsHTMLSpanElement(thumb)
				return e.clientX - thumb.getBoundingClientRect().left
			}
		case 'right':
			return (e, thumb) => {
				assertsIsHTMLSpanElement(thumb)
				return e.clientX - thumb.getBoundingClientRect().right
			}
		default:
			return (e, thumb) => {
				assertsIsHTMLSpanElement(thumb)

				const { width, right } = thumb.getBoundingClientRect()

				return width / 2 - (right - e.clientX)
			}
	}
}

export default function SliderThumb({
	sliderId,
	title,
	value = 0,
	width,
	alignment = 'center',
	min = 0,
	max = 100,
	range = max - min,
	sliderMin = 0,
	step = 1,
	microStep = 0.5,
	onChange,
	onDoubleClick,
	thumbRef,
	trackRef
}: Props) {
	sliderMin = sliderMin ?? min
	
	const thumbPos = useRef(0)
	const mousePos = useRef(0)

	const getClickPos = createClickPositionGetter(alignment)

	const drag = useEffectEvent((e: MouseEvent, clickPos: number, track?: DOMRect) => {
		e.preventDefault()

		track ??= trackRef.current?.getBoundingClientRect()

		assertsIsDOMRect(track)

		const nextMousePos = (e.clientX - (track.left ?? 0) - clickPos) / (track.width ?? 1) * range + sliderMin
		const prevMousePos = mousePos.current ?? nextMousePos

		mousePos.current = nextMousePos

		if (nextMousePos === prevMousePos) return

		let nextThumbPos = prevMousePos

		if (e.shiftKey && nextMousePos < prevMousePos) {
			nextThumbPos = thumbPos.current - microStep
		} else if (e.shiftKey && nextMousePos > prevMousePos) {
			nextThumbPos = thumbPos.current + microStep
		} else {
			nextThumbPos = (nextMousePos / step << 0) * step
		}

		if (nextThumbPos === thumbPos.current) return
		
		onChange(clamp(nextThumbPos, min, max))
	})

	const startDrag: StartDrag = useEffectEvent((e, clickPos, thumb, track) => {
		e.preventDefault()
		e.stopPropagation()

		thumb ??= e.currentTarget
		clickPos ??= getClickPos(e, thumb)

		thumb?.focus()
	
		const controller = new AbortController()
		const { signal } = controller

		const onMouseUp = () => {
			controller.abort()
		}
	
		window.addEventListener('mousemove', e => {
			drag(e, clickPos, track)
		}, { signal })

		window.addEventListener('mouseup', onMouseUp, { signal })
		window.addEventListener('contextmenu', onMouseUp, { signal })
	})

	useImperativeHandle(thumbRef, () => ({ startDrag }))

	const keyIncrement = (e: KeyboardEvent<HTMLSpanElement>) => {
		const rightOrUp = e.key === 'ArrowRight' || e.key === 'ArrowUp'

		if (!rightOrUp && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown') return

		e.preventDefault()

		const incr = e.shiftKey ? microStep : step
		const next = rightOrUp ? Math.min(value + incr, max) : Math.max(value - incr, min)

		onChange(next)
	}

	useEffect(() => {
		thumbPos.current = value
	}, [value])

	return (
		<span
			id={sliderId}
			title={title}
			onMouseDown={e => startDrag(e)}
			onKeyDown={keyIncrement}
			{...!!onDoubleClick ? { onDoubleClick } : {}}
			style={{
				left: `${clamp((value - sliderMin) / range * 100, 0, 100)}%`,
				...width ? { width: `${width}%` } : {}
			}}
			tabIndex={0}
			role="slider"></span>
	)
}
