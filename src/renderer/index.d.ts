import { NAMESPACE } from './constants'

import { electronAPI } from '../preload'

declare global {
	interface Window {
		[NAMESPACE]: {
			electronAPI: typeof electronAPI
		}
	}
}

export {}
