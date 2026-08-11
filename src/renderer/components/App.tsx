import React, { use, useEffect } from 'react'
import toastr from 'toastr'

import '../css/global.css'

import { DEFAULT_VALUE } from '../constants'
import { useToggle } from '../hooks'

import { ElectronAPI, ElectronAPIProvider } from '../context/ElectronAPIContext'
import { LayoutContextProvider } from '../context/LayoutContext'
import { ResponseContext, ResponseContextProvider } from '../context/ResponseContext'
import { SaveContextProvider } from '../context/SaveContext'

import ImageStitch from './image_stitch/ImageStitch'
import ControlPanel from './control_panel/ControlPanel'
import SideBar from './control_panel/SideBar'

function Main() {
	const { setErrorListener, removeErrorListener } = use(ElectronAPI)
	const { imageAFormat, isImageBLoaded, isVertical } = use(ResponseContext)
	const [ isLeftLayout, toggleIsLeftLayout ] = useToggle(DEFAULT_VALUE.LEFT_ALIGNED)

	useEffect(() => {
		setErrorListener((err: Error) => {
      toastr.error(err.message)
    })

		return removeErrorListener
	}, [])

	return (
		<main className={isLeftLayout ? 'left-aligned' : ''}>
			<LayoutContextProvider isVertical={isVertical}>
				<SaveContextProvider
					imageAFormat={imageAFormat}
					isImageBLoaded={isImageBLoaded}>
					<div className="stage">
						<ImageStitch />
						<ControlPanel />
					</div>
					<SideBar
						isLeftLayout={isLeftLayout}
						toggleIsLeftLayout={toggleIsLeftLayout} />
				</SaveContextProvider>
			</LayoutContextProvider>
		</main>
	)
}

export default function App() {
	return (
		<ElectronAPIProvider>
			<ResponseContextProvider>
				<Main />
			</ResponseContextProvider>
		</ElectronAPIProvider>
	)
}
