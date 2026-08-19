import { ipcRenderer, type IpcRendererEvent } from 'electron'

import type { ChannelsWithPayload, ChannelsWithoutPayload, IpcChannel, IpcPayload, IpcResponse } from '../types'

// Overload Signatures
export function send<K extends ChannelsWithPayload>(channel: K, payload: IpcChannel[K]['payload']): void
export function send<K extends ChannelsWithoutPayload>(channel: K): void

// Implementation Signature
export function send<K extends keyof IpcChannel>(
	channel: K,
	payload?: unknown
) {
	ipcRenderer.send(channel, payload)
}

// Overload Signatures
export function invoke<K extends ChannelsWithPayload>(channel: K, payload: IpcChannel[K]['payload']): void
export function invoke<K extends ChannelsWithoutPayload>(channel: K): void

// Implementation Signature
export function invoke<K extends keyof IpcChannel>(
	channel: K,
	payload?: IpcPayload<K>
): Promise<IpcResponse<K>> {
	return ipcRenderer.invoke(channel, payload)
}

export function setListener<K extends keyof IpcChannel>(
	channel: K,
	callback: K extends ChannelsWithPayload
		? (evt: IpcRendererEvent, res: IpcPayload<K>) => void
		: (evt: IpcRendererEvent) => void
) {
	ipcRenderer.on(channel, callback)
}

export function removeAllListeners<K extends keyof IpcChannel>(channel: K) {
	ipcRenderer.removeAllListeners(channel)
}
