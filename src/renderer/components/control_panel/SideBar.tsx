import React from 'react'

import { LABEL } from '../../constants'
import { UseToggleDispatch } from '../../types'

import FitOptions from './FitOptions'
import SaveOptions from './SaveOptions'
import IconButton from '../utility_components/IconButton'

interface Props {
  isLeftLayout: boolean,
  toggleIsLeftLayout: UseToggleDispatch
}

export default function SideBar({ isLeftLayout, toggleIsLeftLayout }: Props) {
  return (
    <div className="sidebar">
      <FitOptions />
      <SaveOptions />
      <IconButton
        icon={`dock_to_${isLeftLayout ? 'left' : 'right'}`}
        title={isLeftLayout ? LABEL.MOVE_TO_RIGHT : LABEL.MOVE_TO_LEFT}
        onClick={() => toggleIsLeftLayout()} />
    </div>
  )
}
