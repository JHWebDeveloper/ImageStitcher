import path from 'node:path'

export const BUILD_PATH = path.resolve('build')

export const PAGES: readonly string[] = ['index']

const SRC_DIR = path.resolve(__dirname, '..', '..', 'src')

export const RENDERER_PATH = path.join(SRC_DIR, 'renderer')

export const BUILD_ASSETS_PATH = path.join(SRC_DIR, 'build_assets')

export const CSS_PATH = path.join(RENDERER_PATH, 'css')

export const INDEX_PATH = path.join(RENDERER_PATH, `${PAGES[0]}.tsx`)

export const MAIN_PATH = path.join(SRC_DIR, 'main')

export const PRELOAD_PATH = path.join(SRC_DIR, 'preload')
