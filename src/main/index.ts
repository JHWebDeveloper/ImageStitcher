import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, shell, nativeTheme } from 'electron'

import { IS_DEV, IS_MAC, PRELOAD_PATH } from './constants'
import { createBrowserWindowOptions, doesFileExist } from './utilities'

import { setIpcRoutes } from './lib/ipcRoutes'
import { createOrEmptyUploadDirectory } from './lib/fileHandlers'
import { ImageStitchData } from './lib/uploadImages'

let mainWin: BrowserWindow | null = null
let imageStitcher: ImageStitchData | null = null

function createURL(view = 'index') {
	const { href } = IS_DEV
		? new URL(`http://localhost:${process.env.PORT}/${view}.html`)
		: pathToFileURL(path.join(__dirname, 'renderer', `${view}.html`))

	return href
}

async function createMainWindow() {
	if (IS_DEV) { // pause in dev until preload.js is compiled
		let preloadScriptExists = false

		while (!preloadScriptExists) {
			preloadScriptExists = await doesFileExist(PRELOAD_PATH)
		}
	}

	mainWin = new BrowserWindow(createBrowserWindowOptions(PRELOAD_PATH))

	mainWin.loadURL(createURL())

	// Menu.setApplicationMenu(Menu.buildFromTemplate())
	await createOrEmptyUploadDirectory()

	mainWin.on('ready-to-show', async () => {
		if (!imageStitcher) {
			imageStitcher = new ImageStitchData()
			setIpcRoutes(imageStitcher)
		}

		mainWin?.show()

		if (IS_DEV) mainWin?.webContents.openDevTools()
	})

	mainWin.on('close', async () => {
		imageStitcher = null
		mainWin = null
	})
}

const lock = app.requestSingleInstanceLock()

if (!lock) {
	app.quit()
} else {
	app.on('second-instance', () => {
		if (mainWin) {
			if (mainWin.isMinimized()) mainWin.restore()
			mainWin.focus()
		}
	})

	app.on('ready', createMainWindow)
}

app.on('window-all-closed', () => {
	if (!IS_MAC) app.quit()
})

app.on('activate', () => {
	if (!mainWin) createMainWindow()
})
