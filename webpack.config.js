module.exports = {
  output: {
    filename: 'hybrids.js',
    libraryTarget: 'umd',
    library: 'hybrids',
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'eslint-loader', enforce: 'pre' },
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
  mode: 'production',
  devtool: 'source-map',
};
