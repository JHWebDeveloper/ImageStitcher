import { promises as fsp } from 'node:fs'
import type { FormatEnum } from 'sharp'

export * from '../../shared/utilities'

export function swapPropertiesMutative<T>(objA: T, objB: T, ...fields: (keyof T)[]) {
	for (const field of fields) {
		const valueA = objA[field]

		objA[field] = objB[field]
		objB[field] = valueA
	}
}

export function createBrowserWindowOptions(
	preload: string,
	opts: Electron.BrowserWindowConstructorOptions = {}
): Electron.BrowserWindowConstructorOptions {
	const {
		width = 1440,
		height = 720,
		minWidth = 720,
		minHeight = 360,
		...restOpts
	} = opts

	return {
		show: false,
		width,
		height,
		minWidth,
		minHeight,
		webPreferences: {
			preload
		},
		useContentSize: true,
		...restOpts
	}
}

export async function doesFileExist(path: string) {
	try {
		await fsp.stat(path)
		return true
	} catch {
		return false
	}
}

export function isError(err: unknown): err is Error {
	return Error.isError(err)
}

export const formatBase64String = (base64: string, format: keyof FormatEnum) => (
	`data:image/${format};base64,${base64}`
)

export const xor = (a: boolean, b: boolean) => !!(Number(a) ^ Number(b))
