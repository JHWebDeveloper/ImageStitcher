import webpack from 'webpack'
import { merge } from 'webpack-merge'
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin'

import { INDEX_PATH } from './constants'
import rendererCommon from './webpack.config.renderer.common'

const config: webpack.Configuration = {
	entry: {
		index: [INDEX_PATH]
	},
	plugins: [
		new CSSMinimizerPlugin()
	]
}

export default merge(rendererCommon, config)
