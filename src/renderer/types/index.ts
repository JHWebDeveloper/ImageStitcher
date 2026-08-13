import type { Dispatch, DragEvent, MouseEvent, SetStateAction } from 'react'

export * from '../../shared/types'

export type UseToggleDispatch = (newValue?: boolean) => void

export type DivDragEvent = DragEvent<HTMLDivElement>

export interface SliderThumbProps {
	value: number
	min?: number
	max?: number
	onChange: (value: number) => void
	title?: string
	width?: number
	alignment?: 'left' | 'right' | 'center'
}

export type StartDrag = (e: MouseEvent<HTMLSpanElement>, clickPos?: number, thumb?: HTMLElement | null, track?: DOMRect) => void

export interface StartDragRef {
	startDrag: StartDrag
}

export interface ChoiceInputProps<T> {
	label?: string
	value?: T
	onChange: Dispatch<SetStateAction<T>> | ((arg: T) => unknown)
	optionLabels: Record<PropertyKey, string>
	optionValues: Record<PropertyKey, T>
}
