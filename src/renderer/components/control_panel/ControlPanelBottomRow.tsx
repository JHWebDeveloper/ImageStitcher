import React, { type MouseEvent, use } from 'react'

import { LABEL } from '../../constants'
import { useElectronAPI } from '../../hooks'

import { ResponseContext } from '../../context/ResponseContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import IconButton from '../utility_components/IconButton'

export default function ControlPanelBottomRow() {
	const { clearBothImages, swapImages, toggleOrientation } = useElectronAPI()
	const { isImageBLoaded, isVertical } = use(ResponseContext)

	const toggleOrientationFromEvent = (e: MouseEvent<HTMLButtonElement>) => {
		toggleOrientation(e.shiftKey, e.metaKey)
	}

	return (
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
	)
}
