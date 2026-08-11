import React, { type PropsWithChildren, createContext } from 'react'

import { DEFAULT_VALUE, LABEL_LR_VALUES, LABEL_TB_VALUES } from '../constants'
import { useToggle } from '../hooks'
import { UseToggleDispatch } from '../types'

interface Props extends PropsWithChildren {
  isVertical: boolean
}

type LayoutContext = {
  isLeftLayout: boolean
  toggleIsLeftLayout: UseToggleDispatch
} & (typeof LABEL_LR_VALUES | typeof LABEL_TB_VALUES)

const initState = {
  isLeftLayout: DEFAULT_VALUE.LEFT_ALIGNED,
  toggleIsLeftLayout() {},
  ...LABEL_LR_VALUES
}

export const LayoutContext = createContext<LayoutContext>(initState)

export function LayoutContextProvider({ isVertical, children }: Props) {
  const [ isLeftLayout, toggleIsLeftLayout ] = useToggle(initState.isLeftLayout)
  const labels = isVertical ? LABEL_TB_VALUES : LABEL_LR_VALUES

  return (
    <LayoutContext value={{
      isLeftLayout,
      toggleIsLeftLayout,
      ...labels
    }}>
      { children }
    </LayoutContext>
  )
}
