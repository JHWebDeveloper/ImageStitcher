import 'webpack-dev-server'
import { spawn } from 'node:child_process'
import webpack from 'webpack'
import { merge } from 'webpack-merge'

import { INDEX_PATH } from './constants'
import rendererCommon from './webpack.config.renderer.common'

process.env.PORT = process.env.PORT || '3000'

const config: webpack.Configuration = {
	mode: 'development',
	entry: {
		index: [
			`webpack-dev-server/client?http://localhost:${process.env.PORT}/build`,
			'webpack/hot/only-dev-server',
			INDEX_PATH
		]
	},
	devServer: {
		port: process.env.PORT,
		hot: true,
		headers: { 'Access-Control-Allow-Origin': '*' },
		static: {
			publicPath: '/'
		},
		setupMiddlewares(middlewares) {
			console.log('Starting preload.js builder...')

			const preloadProcess = spawn('npm', ['run', 'start:preload'], {
				shell: true,
				stdio: 'inherit'
			}).on('close', code => {
				process.exit(code)
			}).on('error', err => {
				console.error(err)
			})

			console.log('Starting Main Process...')

			spawn('npm', ['run', 'start:main'], {
				shell: true,
				stdio: 'inherit'
			}).on('close', code => {
				preloadProcess.kill()
				process.exit(code)
			}).on('error', err => {
				console.error(err)
			})

			return middlewares
		}
	},
	watch: true
}

export default merge(rendererCommon, config)
