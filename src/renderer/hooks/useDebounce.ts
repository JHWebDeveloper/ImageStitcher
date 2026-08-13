import { useRef } from 'react'

type Callback<T> = (...args: T[]) => unknown

function debounce<T>(callback: Callback<T>, delay: number) {
	let timeout: NodeJS.Timeout | undefined

	return (...args: Parameters<typeof callback>) => {
		clearTimeout(timeout)

		timeout = setTimeout(() => {
			clearTimeout(timeout)
			callback(...args)
		}, delay)
	}
}

export function useDebounce<T>(callback: Callback<T>, delay: number) {
	const debouncedFunction = useRef(debounce(callback, delay))

	return [ debouncedFunction.current, callback ]
}
