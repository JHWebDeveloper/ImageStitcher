import { NAMESPACE } from './constants'

import type { ElectronAPI } from '../preload'

declare global {
	interface Window {
		[NAMESPACE]: {
			electronAPI: ElectronAPI
		}
	}
}

export {}
