import React from 'react'

interface Props {
  label: string,
  checked: boolean,
  onChange: (value?: boolean) => void
}

export default function Checkbox({
  label,
  checked,
  onChange
}: Props) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => {
          onChange(e.target.checked)
        }}  />
      <span>{ label }</span>
    </label>
  )
}
