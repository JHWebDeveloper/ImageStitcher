import React, { use } from 'react'

import { FIT_TYPE } from '../../constants'

import { ResponseContext } from '../../context/ResponseContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import FitOptions from './FitOptions'
import AlignmentOptions from './AlignmentOptions'
import BackgroundColorOptions from './BackgroundColorOptions'
import BackgroundOpacityOptions from './BackgroundOpacityOptions'
import SaveOptions from './SaveOptions'

export default function SideBar() {
  const { fitType, isVertical } = use(ResponseContext)
  const isContain = fitType === FIT_TYPE.CONTAIN

  return (
    <div className="sidebar">
      <FitOptions>
        <ToggleComponent shouldShow={isContain || fitType === FIT_TYPE.COVER}>
          <AlignmentOptions isVertical={isVertical} />
        </ToggleComponent>
        <ToggleComponent shouldShow={isContain}>
          <BackgroundColorOptions />
          <BackgroundOpacityOptions />
        </ToggleComponent>
      </FitOptions>
      <SaveOptions />
    </div>
  )
}
