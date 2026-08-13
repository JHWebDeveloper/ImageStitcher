import React, { use, useEffect, useRef } from 'react'

import { LABEL, SIDE } from '../../constants'
import { useDebounce } from '../../hooks'
import type { DivDragEvent } from '../../types'
import { assertsIsDOMRect } from '../../utilities'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { ResponseContext } from '../../context/ResponseContext'
import { LayoutContext } from '../../context/LayoutContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import ImageDrop from './ImageDrop'

function onDragEnter(e: DivDragEvent): void {
	e.preventDefault()
	e.currentTarget.classList.add('dragging-over')
}

function onDragLeave(e: DivDragEvent): void {
	e.currentTarget.classList.remove('dragging-over')
}

export default function ImageStitch() {
	const { setPreviewBounds, uploadImages } = use(ElectronAPI)
	const { base64, isImageALoaded, isImageBLoaded, isVertical } = use(ResponseContext)
	const { labelA, labelB } = use(LayoutContext)
	const previewWindow = useRef<HTMLDivElement>(null)

	const [ setPreviewBoundsDebounced, initPreviewBounds ] = useDebounce(() => {
		const rect = previewWindow.current?.getBoundingClientRect()
		assertsIsDOMRect(rect)
		setPreviewBounds(rect.width, rect.height)
	}, 60)

	useEffect(() => {
		const controller = new AbortController()
		const { signal } = controller

		initPreviewBounds()

		window.addEventListener('resize', () => {
			setPreviewBoundsDebounced()
		}, { signal })

		return () => {
			controller.abort()
		}
	}, [])

	const onClick = () => {
		if (!isImageALoaded) uploadImages()
	}

	return (
		<div
			className={`image-stitch${isVertical ? ' portrait' : ''}`}
			ref={previewWindow}
			onDragOver={onDragEnter}
			onDragLeave={onDragLeave}
			onDrop={onDragLeave}
			onClick={onClick}
			tabIndex={isImageALoaded ? -1 : 0}>
			<ToggleComponent shouldShow={!isImageALoaded}>
				<span className="material-symbols-rounded">add_photo_alternate</span>
			</ToggleComponent>
			<ToggleComponent shouldShow={!!base64}>
				<img
					className="image-stitch-result"
					src={base64}
					alt="result" />
			</ToggleComponent>
			<ToggleComponent shouldShow={isImageALoaded && !isImageBLoaded}>
				<ImageDrop
					side={SIDE.A}
					label={`${LABEL.INSERT} ${labelA}`}
					shouldReplace={false} />
			</ToggleComponent>
			<ImageDrop
				side={SIDE.A}
				label={`${isImageALoaded ? LABEL.REPLACE : LABEL.UPLOAD} ${isImageBLoaded ? labelA : LABEL.IMAGE}`} 
				allowMultiple={!(isImageALoaded && isImageBLoaded)} />
			<ToggleComponent shouldShow={isImageALoaded}>
				<ImageDrop
					side={SIDE.B}
					label={`${isImageBLoaded ? LABEL.REPLACE : LABEL.INSERT} ${labelB}`} />
			</ToggleComponent>
		</div>
	)
}