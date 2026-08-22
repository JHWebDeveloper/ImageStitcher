import { use } from 'react'

import { ElectronAPI } from '../context/ElectronAPIContext'

export function useElectronAPI() {
	return use(ElectronAPI)
}
