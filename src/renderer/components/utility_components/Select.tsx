import React, { type ChangeEvent, type Dispatch, type SetStateAction, useId } from 'react'

import { assertsIsKeyInObject, assertsIsStringInUnion } from '../../utilities'

interface OptionsProps<T> {
  optionLabels: Record<string, string>,
  optionValues: Record<string, T>,
}

interface SelectProps<T> extends OptionsProps<T> {
  value?: T,
  onChange: Dispatch<SetStateAction<T>> | Function
}

function Options<T extends string>({ optionLabels, optionValues }: OptionsProps<T>) {
  const id = useId()

  return Object.entries(optionValues).map(([ key, val ], i) => {
    assertsIsKeyInObject(key, optionLabels)

    return <option key={`${id}_${i}`} value={val}>{optionLabels[key]}</option>
  })
}

export default function Select<const T extends string>({
  value,
  onChange,
  optionLabels,
  optionValues
}: SelectProps<T>) {
  const onChangeFromEvent = (e: ChangeEvent<HTMLSelectElement>) => {
    assertsIsStringInUnion<T>(e.target.value, Object.values(optionValues))
    onChange(e.target.value)
  }
  
  return (
    <select
      value={value}
      onChange={onChangeFromEvent}>
      <Options<T>
        optionLabels={optionLabels}
        optionValues={optionValues} />
    </select>
  )
}
