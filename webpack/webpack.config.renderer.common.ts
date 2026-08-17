import path from 'node:path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import postcssPresetEnv from 'postcss-preset-env'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import { BUILD_PATH, CSS_PATH, PAGES, RENDERER_PATH } from './constants'

import common from './webpack.config.common'

const config: webpack.Configuration = {
	target: [ 'web', 'electron-renderer' ],
	entry: {
		common: [
			'react',
			'react-dom',
			'prop-types',
			path.join(CSS_PATH, 'global.css')
		],
		...PAGES.slice(1).reduce((acc, pageName) => (
			{ ...acc, [pageName]: path.join(RENDERER_PATH, `${pageName}.tsx`) }
		), {})
	},
	output: {
		path: path.join(BUILD_PATH, 'renderer'),
		filename: '[name].bundle.js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							url: false
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									postcssPresetEnv({
										stage: 0
									})
								]
							}
						}
					}
				]
			},
			{
				test: /\.(woff2?|eot|ttf|otf)$/i,
				type: 'asset/resource'
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(RENDERER_PATH, 'font'),
					to: path.join('assets', 'font')
				}
			]
		}),
		new MiniCssExtractPlugin({
			filename: path.join('assets', 'css', '[name].min.css')
		}),
		...PAGES.map(pageName => {
			const filename = `${pageName}.html`

			return new HtmlWebpackPlugin({
				filename,
				template: path.join(RENDERER_PATH, filename),
				inject: false
			})
		})
	]
}

export default merge(common, config)
