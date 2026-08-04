import type { DragEvent, MouseEvent } from 'react'

export * from '../../shared/types'

export type UseToggleDispatch = (newValue?: boolean) => void 

export type DivDragEvent = DragEvent<HTMLDivElement>

export interface SliderThumbProps {
	value: number,
	min?: number,
	max?: number,
	onChange: (value: number) => void
	title?: string
	width?: number
	alignment?: 'left' | 'right' | 'center'
}

export type StartDrag = (e: MouseEvent<HTMLSpanElement>, clickPos?: number, thumb?: HTMLElement | null, track?: DOMRect) => void

export interface StartDragRef {
  startDrag: StartDrag
}
