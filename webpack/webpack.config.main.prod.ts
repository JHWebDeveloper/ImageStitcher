import path from 'node:path'
import { merge } from 'webpack-merge'
import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

import { BUILD_ASSETS_PATH, BUILD_PATH, MAIN_PATH } from './constants'
import common from './webpack.config.common'

const config: webpack.Configuration = {
	mode: 'production',
	target: 'electron-main',
	entry: MAIN_PATH,
	output: {
		path: BUILD_PATH,
		filename: 'main.cjs'
	},
	externals: [
		nodeExternals(),
		{
			sharp: 'commonjs sharp'
		}
	],
	plugins: [
		// new CopyWebpackPlugin({
		// 	patterns: [
		// 		{
		// 			from: path.join(BUILD_ASSETS_PATH, 'icons'),
		// 			to: path.join(BUILD_PATH, 'icons')
		// 		}
		// 	]
		// })
	]
}

export default merge(common, config)
