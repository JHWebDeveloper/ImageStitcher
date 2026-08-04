import { merge } from 'webpack-merge'

import preloadCommon from './webpack.config.preload.common'

export default merge(preloadCommon, {
	mode: 'development',
	watch: true
})
