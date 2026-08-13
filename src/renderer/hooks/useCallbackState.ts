import { type Dispatch, type SetStateAction, useState } from 'react'

import { assertsIsMatchingType } from '../utilities'

type UseStateCallbackFn<O, I> = (newValue: I, dispatch: Dispatch<SetStateAction<O>>) => void

type UseStateCallbackReturnValue<O, I, C> = [
	O,
	C extends undefined ? Dispatch<SetStateAction<O>> : ((input: I) => void),
	Dispatch<SetStateAction<O>>,
	C
]

interface UseStateCallbackOptions {
	disableAutoDispatch: boolean
}

export function useStateCallback<O, I = O>(
	initState: O,
	callback?: UseStateCallbackFn<O, I>,
	options?: UseStateCallbackOptions
): UseStateCallbackReturnValue<O, I, typeof callback> {
	const [ stateValue, setState ] = useState(initState)

	const dispatch = callback ? (input: I) => {
		let willAutoDispatch = !options?.disableAutoDispatch

		callback(input, nextState => {
			willAutoDispatch = false
			setState(nextState)
		})

		if (willAutoDispatch) {
			assertsIsMatchingType(input, stateValue)
			setState(input)
		}
	} : setState

	return [ stateValue, dispatch, setState, callback ]
}
