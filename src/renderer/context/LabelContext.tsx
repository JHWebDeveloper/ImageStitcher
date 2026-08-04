import React, { type PropsWithChildren, createContext } from 'react'

import { LABEL_LR_VALUES, LABEL_TB_VALUES } from '../constants'

interface Props extends PropsWithChildren {
  isVertical: boolean
}

type LabelPair = typeof LABEL_LR_VALUES | typeof LABEL_TB_VALUES

export const LabelContext = createContext<LabelPair>(LABEL_LR_VALUES)

export function LabelContextProvider({ isVertical, children }: Props) {
  const labels = isVertical ? LABEL_TB_VALUES : LABEL_LR_VALUES

  return (
    <LabelContext value={labels}>
      { children }
    </LabelContext>
  )
}
