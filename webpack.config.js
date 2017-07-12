const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'hybrids',
    sourceMapFilename: '[file].map',
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'eslint-loader', enforce: 'pre' },
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
  resolve: {
    mainFields: ['jsnext:main', 'main'],
  },
  devtool: 'source-map',
};
