import React, { type MouseEvent } from 'react'

interface Props {
	name?: string
	icon: string
	iconAngle?: number
	title?: string
	onClick: (e: MouseEvent<HTMLButtonElement>) => void,
	disabled?: boolean
}

export default function IconButton({
	name,
	icon,
	iconAngle = 0,
	title,
	onClick,
	disabled = false
}: Props) {       
	return (
		<button
			type="button"
			name={name}
			title={title}
			onClick={onClick}
			disabled={disabled}>
			<span
				className="material-symbols-rounded"
				style={{
					rotate: `${iconAngle}deg`
				}}>{ icon }</span>
		</button>
	)
}
