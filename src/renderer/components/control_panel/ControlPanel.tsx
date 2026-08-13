import React from 'react'

import ControlPanelTopRow from './ControlPanelTopRow'
import ControlPanelBottomRow from './ControlPanelBottomRow'

export default function ControlPanel() {
	return (
		<div className="control-panel">
			<ControlPanelTopRow />
			<ControlPanelBottomRow />
		</div>
	)
}
