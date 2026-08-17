import React, { use } from 'react'

import { ALIGNMENT_TYPE, LABEL } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'

import IconButton from '../utility_components/IconButton'

interface Props {
	isVertical: boolean
}

export default function AlignmentOptions({ isVertical }: Props) {
	const { setAlignmentType } = use(ElectronAPI)
	const [ labelStart, labelEnd, horizontalOrVertical ] = isVertical
		? [ LABEL.LEFT, LABEL.RIGHT, 'horizontal' ]
		: [ LABEL.TOP, LABEL.BOTTOM, 'vertical' ]

	return (
		<fieldset name="alignment-options">
			<legend>{LABEL.ALIGNMENT}</legend>
			<IconButton
				icon={`align_${horizontalOrVertical}_${labelStart}`}
				title={`${LABEL.ALIGN_TO} ${labelStart}`}
				onClick={() => {
					setAlignmentType(ALIGNMENT_TYPE.START)
				}} />
			<IconButton
				icon={`align_${horizontalOrVertical}_center`}
				title={`${LABEL.ALIGN_TO} ${LABEL.CENTER}`}
				onClick={() => {
					setAlignmentType(ALIGNMENT_TYPE.MIDDLE)
				}} />
			<IconButton
				icon={`align_${horizontalOrVertical}_${labelEnd}`}
				title={`${LABEL.ALIGN_TO} ${labelEnd}`}
				onClick={() => {
					setAlignmentType(ALIGNMENT_TYPE.END)
				}} />
		</fieldset>
	)
}
