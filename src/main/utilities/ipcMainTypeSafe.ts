import { ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

import type { ChannelsWithPayload, ChannelsWithoutPayload, IpcChannel, IpcPayload, IpcResponse, PossiblePromise } from '../types'

export function setListener<K extends keyof IpcChannel>(
	channel: K,
	callback: K extends ChannelsWithPayload
		? (evt: IpcMainEvent, opts: IpcChannel[K]['payload']) => void
		: (evt: IpcMainEvent) => void
) {
	ipcMain.on(channel, callback)
}

type HandlerResponse<K extends keyof IpcChannel> = PossiblePromise<IpcResponse<K>> | Promise<void>

export function setHandler<K extends keyof IpcChannel>(
	channel: K,
	callback: K extends ChannelsWithPayload
		? (evt: IpcMainInvokeEvent, opts: IpcChannel[K]['payload']) => HandlerResponse<K>
		: (evt: IpcMainInvokeEvent) => HandlerResponse<K>
) {
	ipcMain.handle(channel, callback)
}

type IpcEvent = IpcMainEvent | IpcMainInvokeEvent

// Overload Signature
export function send<K extends ChannelsWithPayload>(
	evt: IpcEvent,
	channel: K,
	payload: IpcChannel[K]['payload']
): void

// Overload Signature
export function send<K extends ChannelsWithoutPayload>(
	evt: IpcEvent,
	channel: K
): void

// Implementation Signature
export function send<K extends keyof IpcChannel>(
	evt: IpcEvent,
	channel: K,
	payload?: IpcPayload<K>
) {
	evt.sender.send(channel, payload)
}
