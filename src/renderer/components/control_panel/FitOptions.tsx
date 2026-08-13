import React, { use } from 'react'

import { FIT_TYPE, LABEL } from '../../constants'
import type { FitTypeValue } from '../../types'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { ResponseContext } from '../../context/ResponseContext'

import Select from '../utility_components/Select'
import ToggleComponent from '../utility_components/ToggleComponent'
import AlignmentOptions from './AlignmentOptions'
import BackgroundColorOptions from './BackgroundColorOptions'
import BackgroundOpacityOptions from './BackgroundOpacityOptions'

export default function FitOptions() {
	const { fitType, isVertical } = use(ResponseContext)
	const { setFitType } = use(ElectronAPI)
	const isContain = fitType === FIT_TYPE.CONTAIN

	return (
		<div className="fit-options">
			<Select<FitTypeValue>
				label={LABEL.SIZING}
				value={fitType}
				onChange={setFitType}
				optionLabels={LABEL}
				optionValues={FIT_TYPE} />
			<ToggleComponent shouldShow={isContain || fitType === FIT_TYPE.COVER}>
				<AlignmentOptions isVertical={isVertical} />
			</ToggleComponent>
			<ToggleComponent shouldShow={isContain}>
				<fieldset name="background-color">
					<legend>{LABEL.BACKGROUND_COLOR}</legend>
					<BackgroundColorOptions />
					<BackgroundOpacityOptions />
				</fieldset>
			</ToggleComponent>
		</div>
	)
}
