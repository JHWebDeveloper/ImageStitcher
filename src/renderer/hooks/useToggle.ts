import { useState } from 'react'

import type { UseToggleDispatch } from '../types'

export function useToggle(initState = false): [ boolean, UseToggleDispatch ] {
	const [ value, setValue ] = useState<boolean>(initState)

	const toggleValue: UseToggleDispatch = newValue => {
		setValue((currentValue: boolean) => (
			typeof newValue === 'boolean' ? newValue : !currentValue
		))
	}

	return [ value, toggleValue ]
}
