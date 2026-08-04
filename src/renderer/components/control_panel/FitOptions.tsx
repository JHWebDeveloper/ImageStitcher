import React, { type PropsWithChildren, use } from 'react'

import { FIT_TYPE, LABEL } from '../../constants'
import type { FitTypeValue } from '../../types'

import { ElectronAPI } from '../../context/ElectronAPIContext'

import Select from '../utility_components/Select'

interface Props extends PropsWithChildren {}

export default function FitOptions({ children }: Props) {
  const { setFitType } = use(ElectronAPI)

  return (
    <div className="fit-options">
      <Select<FitTypeValue>
        onChange={setFitType}
        optionLabels={LABEL} 
        optionValues={FIT_TYPE} />
      { children }
    </div>
  )
}
