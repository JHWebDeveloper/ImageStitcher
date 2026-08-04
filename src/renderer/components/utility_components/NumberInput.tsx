import React, { type ChangeEvent, type KeyboardEvent, useState } from 'react'

import { round } from '../../utilities'

interface Props {
  value: number
  defaultValue?: number
  min?: number
  max?: number
  allowNegativeValues?: boolean,
  onChange: (value: number) => void
}

function forbidNegative(e: KeyboardEvent) {
	if (e.key === '-') e.preventDefault()
}

export default function NumberInput({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  allowNegativeValues = true,
  onChange
}: Props) {
  const [ isEmpty, setIsEmpty ] = useState(false)

  const setNumberValue = (value: number) => {
    if (isEmpty) setIsEmpty(false)
    onChange(value)
  }

  const onChangeFromEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const { valueAsNumber } = e.currentTarget

    if (Number.isNaN(valueAsNumber)) {
      setIsEmpty(true)
      setNumberValue(0)
    } else {
      setNumberValue(round(valueAsNumber))
    }
  }

  const onBlur = () => {
    if (isEmpty) {
      setNumberValue(defaultValue)
    } else if (value < min) {
      setNumberValue(min)
    } else if (value > max) {
      setNumberValue(max)
    }
  }

  return (
    <input
      type="number"
      value={isEmpty ? '' : value}
      onChange={onChangeFromEvent}
      onBlur={onBlur}
      min={min}
      max={max}
      {...allowNegativeValues ? {} : {
        onKeyDown: forbidNegative
      }} />
  )
}
