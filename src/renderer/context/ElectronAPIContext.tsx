import React, { createContext, type PropsWithChildren } from 'react'

import { NAMESPACE } from '../constants'

interface Props extends PropsWithChildren {}

const { electronAPI } = window[NAMESPACE]

export const ElectronAPI = createContext(electronAPI)

export function ElectronAPIProvider({ children }: Props) {
	return (
		<ElectronAPI value={electronAPI}>
			{ children }
		</ElectronAPI>
	)
}
