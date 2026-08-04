import React, { use } from 'react'

import { LABEL } from '../../constants'
import type { TempImageName } from '../../types'

import { ElectronAPI } from '../../context/ElectronAPIContext'

import IconButton from '../utility_components/IconButton'

interface Props {
  side: TempImageName
  isSideways: boolean
}

export default function RotationControls({ side, isSideways }: Props) {
  const { flipImage, flopImage, rotateImage } = use(ElectronAPI)
  const angle = isSideways ? 90 : 0
  
  return (
    <>
      <div className="button-pair">
        <IconButton
          onClick={() => flipImage(side)}
          icon="flip"
          title={isSideways ? LABEL.FLOP : LABEL.FLIP}
          iconAngle={angle + 90} />
        <IconButton
          onClick={() => flopImage(side)}
          icon="flip"
          title={isSideways ? LABEL.FLIP : LABEL.FLOP}
          iconAngle={angle} />
      </div>
      <div className="button-pair">
        <IconButton
          onClick={() => rotateImage(side, true)}
          title={`${LABEL.ROTATE} ${LABEL.LEFT}`}
          icon="rotate_left" />
        <IconButton
          onClick={() => rotateImage(side)}
          title={`${LABEL.ROTATE} ${LABEL.RIGHT}`}
          icon="rotate_right" />
      </div>
    </>
  )
}
