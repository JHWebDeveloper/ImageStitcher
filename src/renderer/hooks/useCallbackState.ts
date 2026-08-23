import { type Dispatch, type SetStateAction, useState } from 'react'

type DispatchState<S> = Dispatch<SetStateAction<S>>

type Callback<S, I> = (nextState: I, setState: DispatchState<S> ) => void

type CustomDispatch<I> = (input: I) => void

// Overload Signatures
export function useStateCallback<S>(initState: S): [S, DispatchState<S>]
export function useStateCallback<S, I = S>(initState: S, callback: Callback<S, I>): [S, CustomDispatch<I>, DispatchState<S>]

// Implementation Signature
export function useStateCallback<S, I = S>(
	initState: S,
	callback?: Callback<S, I>
) {
	const [ stateValue, setState ] = useState(initState)

	if (callback) {
		const customDispatch = (nextState: I) => {
			callback(nextState, setState)
		}

		return [stateValue, customDispatch, setState]
	}

	return [stateValue, setState]
}
