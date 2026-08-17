import webpack from 'webpack'
import merge from 'webpack-merge'

import { BUILD_PATH, PRELOAD_PATH } from './constants'

import common from './webpack.config.common'

const config: webpack.Configuration = {
	target: ['electron-preload'],
	entry: PRELOAD_PATH,
	output: {
		path: BUILD_PATH,
		filename: 'preload.js'
	}
}

export default merge(common, config)
