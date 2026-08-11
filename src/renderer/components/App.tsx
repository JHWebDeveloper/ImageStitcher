import React, { use, useEffect } from 'react'
import toastr from 'toastr'

import '../css/global.css'

import { StitchResult } from '../types'

import { ElectronAPI, ElectronAPIProvider } from '../context/ElectronAPIContext'
import { LayoutContext, LayoutContextProvider } from '../context/LayoutContext'
import { ResponseContext, ResponseContextProvider } from '../context/ResponseContext'
import { SaveContextProvider } from '../context/SaveContext'

import ImageStitch from './image_stitch/ImageStitch'
import ControlPanel from './control_panel/ControlPanel'
import SideBar from './control_panel/SideBar'

interface MainProps extends Pick<StitchResult, 'imageAFormat' | 'isImageBLoaded'> {}

function Main({ imageAFormat, isImageBLoaded }: MainProps) {
	const { setErrorListener, removeErrorListener } = use(ElectronAPI)
	const { isLeftLayout } = use(LayoutContext)

	useEffect(() => {
		setErrorListener((err: Error) => {
      toastr.error(err.message)
    })

		return removeErrorListener
	}, [])

	return (
		<main className={isLeftLayout ? 'left-aligned' : ''}>
			<SaveContextProvider
				imageAFormat={imageAFormat}
				isImageBLoaded={isImageBLoaded}>
				<div className="stage">
					<ImageStitch />
					<ControlPanel />
				</div>
				<SideBar />
			</SaveContextProvider>
		</main>
	)
}

function LayoutContextWrapper() {
	const { imageAFormat, isImageBLoaded, isVertical } = use(ResponseContext)

	return (
		<LayoutContextProvider isVertical={isVertical}>
			<Main
				imageAFormat={imageAFormat}
				isImageBLoaded={isImageBLoaded} />
		</LayoutContextProvider>
	)
}

export default function App() {
	return (
		<ElectronAPIProvider>
			<ResponseContextProvider>
				<LayoutContextWrapper />
			</ResponseContextProvider>
		</ElectronAPIProvider>
	)
}
