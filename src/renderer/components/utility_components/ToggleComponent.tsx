import React, { type PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
	shouldShow?: boolean
}

export default function ToggleComponent({
	shouldShow = true,
	children
}: Props) {
	return shouldShow ? children : <></>
}
