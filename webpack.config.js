module.exports = {
  output: {
    path: './dist',
    filename: '[name].js',
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
  devtool: 'source-map',
};
