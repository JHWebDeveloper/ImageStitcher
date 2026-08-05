import React, { type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useId } from 'react'

import { assertsIsKeyInObject, assertsIsStringInUnion } from '../../utilities'

interface SelectProps<T> {
  value?: T
  onChange: Dispatch<SetStateAction<T | undefined | null>> | Function
  optionLabels: Record<string, string>
  optionValues: Record<string, T>
}

export default function Select<const T extends string>({
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
    if (!isValidSelection) onChange(listOfValues.at(-1))
  }, [isValidSelection])
  
  return isValidSelection ? (
    <select
      value={value}
      onChange={onChangeFromEvent}>
      {Object.entries(optionValues).map(([ key, val ], i) => {
        assertsIsKeyInObject(key, optionLabels)
        return <option key={`${id}_${i}`} value={val}>{optionLabels[key]}</option>
      })}
    </select>
  ) : <></>
}
