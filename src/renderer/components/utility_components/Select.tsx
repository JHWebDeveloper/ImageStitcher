import React, { type ChangeEvent, type PropsWithChildren, useEffect, useId } from 'react'

import type { ChoiceInputProps } from '../../types'
import { assertsIsKeyInObject, assertsIsStringInUnion } from '../../utilities'

interface LabelProps extends Pick<ChoiceInputProps<null>, 'label'>, PropsWithChildren {}

interface SelectProps<T> extends ChoiceInputProps<T> {}

function Label({ label, children }: LabelProps) {
	return label ? (
		<label>
			{ label }
			{ children }
		</label>
	) : children
}

function isDefined<T>(value: T | null | undefined): value is T {
	return !!value
}

export default function Select<const T extends string>({
	label,
	value,
	onChange,
	optionLabels,
	optionValues
}: SelectProps<T>) {
	const id = useId()
	const listOfValues = Object.values(optionValues)
	const isValidSelection = !value || listOfValues.includes(value)

	const onChangeFromEvent = (e: ChangeEvent<HTMLSelectElement>) => {
		assertsIsStringInUnion<T>(e.target.value, listOfValues)
		onChange(e.target.value)
	}

	useEffect(() => {
		if (isValidSelection) return

		const fallback = listOfValues.at(-1)

		if (isDefined(fallback)) onChange(fallback)
	}, [ isValidSelection ])

	return isValidSelection ? (
		<Label label={label}>
			<select
				{...label ? { id } : {}}
				value={value}
				onChange={onChangeFromEvent}>
				{Object.entries(optionValues).map(([ key, val ], i) => {
					assertsIsKeyInObject(key, optionLabels)
					return <option key={`${id}_${i}`} value={val}>{optionLabels[key]}</option>
				})}
			</select>
		</Label>
	) : <></>
}
