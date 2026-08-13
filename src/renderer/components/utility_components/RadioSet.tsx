import React, { type PropsWithChildren, useId } from 'react'

import type { ChoiceInputProps } from '../../types'
import { assertsIsKeyInObject } from '../../utilities'

interface Props<T> extends ChoiceInputProps<T>, PropsWithChildren {
	name: string
}

export default function RadioSet<T>({
	name,
	label,
	value,
	onChange,
	optionLabels,
	optionValues,
	children
}: Props<T>) {
	const id = useId()

	return (
		<fieldset name={name}>
			{label ? <legend>{label}</legend> : <></>}
			{Object.entries(optionValues).map(([ key, val ], i) => {
				assertsIsKeyInObject(key, optionLabels)

				return (
					<label key={`${id}_${i}`}>
						<input
							type="radio"
							name={name}
							checked={value === val}
							onChange={() => onChange(val)} />
						{optionLabels[key]}
					</label>
				)
			})}
			{ children }
		</fieldset>
	)
}
