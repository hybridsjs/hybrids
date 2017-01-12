module.exports = {
  output: {
    path: './dist',
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'hybrids',
    sourceMapFilename: '[file].map',
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'eslint-loader', include: /packages\/[^/]+\/src/, enforce: 'pre' },
      { test: /\.js$/, loader: 'babel-loader' },
    ]
  },
  resolve: {
    mainFields: ['jsnext:main', 'main'],
  },
  devtool: 'source-map',
};
