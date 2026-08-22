import { createContext } from 'react'

import { NAMESPACE } from '../constants'

const { electronAPI } = window[NAMESPACE]

export const ElectronAPI = createContext(electronAPI)
