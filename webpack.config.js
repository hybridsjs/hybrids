const webpack = require('webpack'); /* eslint import/no-extraneous-dependencies: 0 */

module.exports = {
  entry: {
    'hybrids.js': './packages/hybrids/src/index.js',
    'hybrids.min.js': './packages/hybrids/src/index.js',
  },
  output: {
    path: './packages/hybrids/dist',
    filename: '[name]',
    libraryTarget: 'umd',
    library: 'hybrids',
    sourceMapFilename: '[file].map',
  },
  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'eslint', exclude: /node_modules/ },
    ],
    loaders: [
      { test: /\.js$/, loaders: ['babel'] },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.npm_lifecycle_event !== 'dist' ? '' : 'production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
    }),
  ],
  devtool: 'source-map',
};
