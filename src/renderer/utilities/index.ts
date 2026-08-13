export * from '../../shared/utilities'

export function clamp(val: number, min = -Infinity, max = Infinity) {
	if (max < min) {
		throw new RangeError(`Minimum value cannot exceed the maximum value. Received minimum ${min} and maximum ${max}.`)
	}

	return Math.max(min, Math.min(max, val))
}

export function round(value: number, decimals = 2) {
	const multiplier = 10 ** decimals

	return Math.round(value * multiplier) / multiplier
}

export function convertStringToNumber(value: string | number) {
	if (value === '' || Number.isNaN(value)) return null

	return typeof value === 'string' ? parseFloat(value) : value
}

/* -~-~-~- TYPEGUARDS -~-~-~- */

function createTypeError(value: unknown, type: string) {
	return new TypeError(`${value} is not of type ${type}. Received type ${typeof value}.`)
}

export function assertsIsDOMRect(rect: unknown): asserts rect is typeof DOMRect {
	if (!(rect instanceof DOMRect)) throw createTypeError(rect, 'DOMRect')
}

export function assertsIsKeyInObject<T extends object>(
	key: unknown,
	obj: T
): asserts key is keyof typeof obj {
	if (typeof key !== 'string') throw createTypeError(key, 'string')

	if (!(key in obj)) {
		throw new SyntaxError(`"${key}" is not a key in the object. Expected: "${Object.keys(obj).join('", "')}"`)
	}
}

export function assertsIsMatchingType<T>(comparator: unknown, comparand: T): asserts comparator is T {
	if (typeof comparator !== typeof comparand) {
		throw new TypeError(`${comparator} and ${comparand} are not of the same type. Received types ${typeof comparator} and ${typeof comparator}.`)
	}
}

export function assertsIsNumber(value: unknown): asserts value is number {
	if (typeof value !== 'number') {
		throw createTypeError(value, 'number')
	}
}

export function assertsIsStringInUnion<T extends string>(
	value: unknown,
	valuesInUnion: T[] | readonly T[]
): asserts value is T {
	if (typeof value !== 'string') throw createTypeError(value, 'string')

	if (!valuesInUnion.includes(value as T)) {
		throw TypeError(`String "${value}" is not available in union ${valuesInUnion.join(' | ')}. `)
	}
}
