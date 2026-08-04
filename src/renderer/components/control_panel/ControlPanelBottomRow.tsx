import React, { type MouseEvent, use } from 'react'

import { FIT_TYPE, LABEL } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { ResponseContext } from '../../context/ResponseContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import IconButton from '../utility_components/IconButton'
import FitOptions from './FitOptions'
import AlignmentOptions from './AlignmentOptions'
import BackgroundColorOptions from './BackgroundColorOptions'
import BackgroundOpacityOptions from './BackgroundOpacityOptions'
import SaveOptions from './SaveOptions'

export default function ControlPanelBottomRow() {
  const { clearBothImages, swapImages, toggleOrientation } = use(ElectronAPI)
  const { fitType, isImageALoaded, isImageBLoaded, isVertical } = use(ResponseContext)
  const isContain = fitType === FIT_TYPE.CONTAIN

  const toggleOrientationFromEvent = (e: MouseEvent<HTMLButtonElement>) => {
    toggleOrientation(e.shiftKey, e.metaKey)
  }

  return (
    <>
      <FitOptions>
        <ToggleComponent shouldShow={isContain || fitType === FIT_TYPE.COVER}>
          <AlignmentOptions isVertical={isVertical} />
        </ToggleComponent>
        <ToggleComponent shouldShow={isContain}>
          <BackgroundColorOptions />
          <BackgroundOpacityOptions />
        </ToggleComponent>
      </FitOptions>
      <div className="dual-control">
        <ToggleComponent shouldShow={isImageBLoaded}>
          <IconButton
            icon={`swap_${isVertical ? 'vert' : 'horiz'}`}
            onClick={swapImages}
            title={LABEL.SWAP_IMAGES} />
        </ToggleComponent>
        <IconButton
          icon={`splitscreen_${isVertical ? 'portrait' : 'landscape'}`}
          onClick={toggleOrientationFromEvent}
          title={`${LABEL.SWITCH_TO} ${isVertical ? LABEL.LANDSCAPE : LABEL.PORTRAIT}`} />
        <ToggleComponent shouldShow={isImageBLoaded}>
          <IconButton
            icon="close"
            title={`${LABEL.REMOVE} ${LABEL.BOTH_IMAGES}`}
            onClick={clearBothImages} />
        </ToggleComponent>
      </div>
      <SaveOptions isImageALoaded={isImageALoaded} />
    </>
  )
}
