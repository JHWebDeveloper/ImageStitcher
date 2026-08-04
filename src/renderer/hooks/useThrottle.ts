import { useRef } from 'react'

type Callback<T> = (...args: T[]) => unknown

function throttle<T>(
	callback: Callback<T>,
	delay: number
): typeof callback {
	let shouldWait = false
	let lastArgs: T[] | null = null

	return (...args: T[]) => {
		if (shouldWait) {
			lastArgs = args
		} else {
			callback(...args)
			shouldWait = true

			setTimeout(() => {
				if (lastArgs) {
					callback(...lastArgs)
					lastArgs = null
				}

				shouldWait = false
			}, delay)
		}
	}
}

export function useThrottle<T>(callback: Callback<T>, delay: number) {
  const throttledFunction = useRef(throttle(callback, delay))

  return [ throttledFunction.current, callback ]
}
