import React, { type PropsWithChildren, createContext } from 'react'

import { LABEL_LR_VALUES, LABEL_TB_VALUES } from '../constants'

interface Props extends PropsWithChildren {
  isVertical: boolean
}

type LayoutContext = typeof LABEL_LR_VALUES | typeof LABEL_TB_VALUES

export const LayoutContext = createContext<LayoutContext>(LABEL_LR_VALUES)

export function LayoutContextProvider({ isVertical, children }: Props) {
  const labels = isVertical ? LABEL_TB_VALUES : LABEL_LR_VALUES

  return (
    <LayoutContext value={{
      ...labels
    }}>
      { children }
    </LayoutContext>
  )
}
