import React, { use, useEffect } from 'react'
import toastr from 'toastr'

import '../css/global.css'

import { ElectronAPI, ElectronAPIProvider } from '../context/ElectronAPIContext'
import { LabelContextProvider } from '../context/LabelContext'
import { ResponseContext, ResponseContextProvider } from '../context/ResponseContext'
import { SaveContextProvider } from '../context/SaveContext'

import ImageStitch from './image_stitch/ImageStitch'
import ControlPanel from './control_panel/ControlPanel'

function Main() {
	const { setErrorListener, removeErrorListener } = use(ElectronAPI)
	const { imageAFormat, isImageBLoaded, isVertical } = use(ResponseContext)

	useEffect(() => {
		setErrorListener((err: Error) => {
      toastr.error(err.message)
    })

		return () => {
			removeErrorListener()
		}
	}, [])

	return (
		<main>
			<LabelContextProvider isVertical={isVertical}>
				<SaveContextProvider
					imageAFormat={imageAFormat}
					isImageBLoaded={isImageBLoaded}>
					<ImageStitch />
					<ControlPanel />
				</SaveContextProvider>
			</LabelContextProvider>
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
