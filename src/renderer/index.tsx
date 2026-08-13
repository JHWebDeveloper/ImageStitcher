import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './components/App'

const container = document.querySelector('#root')

if (!container) {
	throw new Error('Failed to find a root element')
}

createRoot(container).render(<App />)
