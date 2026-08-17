import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const config: webpack.Configuration = {
	module: {
		rules: [
			{
				test: /\.[tj]sx?$/,
				exclude: /nodemodules/,
				use: ['babel-loader']
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: process.env.NODE_ENV
		})
	],
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
		plugins: [new TsconfigPathsPlugin()]
	},
	node: {
		__dirname: false,
		__filename: false
	}
}

export default config
