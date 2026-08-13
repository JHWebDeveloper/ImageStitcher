import { useState } from "react"

import { convertStringToNumber, round } from '../utilities'

type NumberStringPair = [number, string]

function convertToNumberStringPair(value: number | string, prevNumberValue: number = 0): NumberStringPair {
	if (typeof value === 'string' && value.match(/^-?0(\.0*)?$/)) return [0, value]

	let numberValue = convertStringToNumber(value)

	if (numberValue) numberValue = round(numberValue, 2)

	return [
		numberValue ?? prevNumberValue,
		numberValue?.toString() ?? ''
	]
}

export function useStringNumberPair(initState: number | string): [...NumberStringPair, (newValue: number | string) => void ] {
	const [ [ numberValue, stringValue ], setValue ] = useState(convertToNumberStringPair(initState))

	const setValueStringNumberPair = (newValue: string | number) => {
		setValue(([ prevNumberValue ]) => {
			return convertToNumberStringPair(newValue, prevNumberValue)
		})
	}

	return [ numberValue, stringValue, setValueStringNumberPair ]
}
