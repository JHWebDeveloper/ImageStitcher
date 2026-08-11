import React, { use } from 'react'

import { LABEL } from '../../constants'

import { LayoutContext } from '../../context/LayoutContext'

import FitOptions from './FitOptions'
import SaveOptions from './SaveOptions'
import IconButton from '../utility_components/IconButton'

export default function SideBar() {
  const { isLeftLayout, toggleIsLeftLayout } = use(LayoutContext)

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
