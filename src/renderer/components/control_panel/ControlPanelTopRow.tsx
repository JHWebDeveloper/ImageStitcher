import React, { use } from 'react'

import { LABEL, SIDE } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { ResponseContext } from '../../context/ResponseContext'
import { LayoutContext } from '../../context/LayoutContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import RotationControls from './RotationControls'
import StitchAdjustControls from './StitchAdjustControls'
import IconButton from '../utility_components/IconButton'

export default function ControlPanelTopRow() {
  const { clearImage, uploadImage, uploadImages } = use(ElectronAPI)
  const { isImageBLoaded, isVertical, ...responseCtx }  = use(ResponseContext)
  const { labelA, labelB } = use(LayoutContext)

  return (
    <>
      <ToggleComponent shouldShow={responseCtx.isImageALoaded}>
        <div className={`single-control${isImageBLoaded ? '' : ' extended'}`}>
          <ToggleComponent shouldShow={isImageBLoaded}>
            <IconButton
              icon="replace_image"
              title={`${LABEL.REPLACE} ${labelA} ${LABEL.IMAGE}`}
              onClick={() => uploadImage(SIDE.A, null, true)} />
          </ToggleComponent>
          <ToggleComponent shouldShow={!isImageBLoaded}>
            <IconButton
              icon={isVertical ? 'add_row_above' : 'add_column_left'}
              title={`${LABEL.INSERT} ${LABEL.IMAGE} ${isVertical ? LABEL.ABOVE : labelA}`}
              onClick={() => uploadImage(SIDE.A)} />
            <IconButton
              icon={isVertical ? 'add_row_below' : 'add_column_right'}
              title={`${LABEL.INSERT} ${LABEL.IMAGE} ${isVertical ? LABEL.BELOW : labelB}`}
              onClick={() => uploadImage(SIDE.A)} />
            <IconButton
              icon="replace_image"
              title={`${LABEL.REPLACE} ${LABEL.IMAGE}`}
              onClick={() => uploadImages()} />
          </ToggleComponent>
          <RotationControls
            side={SIDE.A}
            isSideways={responseCtx.isImageASideways} />
          <IconButton
            icon="close"
            title={`${LABEL.REMOVE} ${labelA} ${LABEL.IMAGE}`}
            onClick={() => clearImage(SIDE.A)} />
        </div>
      </ToggleComponent>
      <ToggleComponent shouldShow={isImageBLoaded}>
        <StitchAdjustControls isVertical={isVertical} />
        <div className="single-control">
          <IconButton
            icon="replace_image"
            title={`${LABEL.REPLACE} ${labelB} ${LABEL.IMAGE}`}
            onClick={() => uploadImage(SIDE.B, null, true)} />
          <RotationControls
            side={SIDE.B}
            isSideways={responseCtx.isImageBSideways} />
          <IconButton
            icon="close"
            title={`${LABEL.REMOVE} ${labelB} ${LABEL.IMAGE}`}
            onClick={() => clearImage(SIDE.B)} />
        </div>
      </ToggleComponent>
    </>
  )
}
