import React, { type Dispatch, type PropsWithChildren, type SetStateAction, useId } from 'react'
import { assertsIsKeyInObject } from '../../utilities'

interface Props<T> extends PropsWithChildren {
  name: string
  label?: string
  value?: T
  onChange: Dispatch<SetStateAction<T | undefined | null>> | Function
  optionLabels: Record<PropertyKey, string>
  optionValues: Record<PropertyKey, T>
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
              onChange={() => onChange(val)}/>
              {optionLabels[key]}
          </label>
        )
      })}
      { children }
    </fieldset>
  )
}
