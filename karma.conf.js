const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    frameworks: ['jasmine'],
    reporters: ['dots', 'coverage'],
    browsers: process.env.TRAVIS ? ['ChromeTravis'] : ['Chrome'],
    files: ['test/runner.js'],
    preprocessors: {
      'test/runner.js': ['webpack', 'sourcemap'],
    },
    webpack: {
      module: {
        ...webpackConfig.module,
      },
      devtool: 'inline-source-map',
      mode: 'development',
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': 'env',
        }),
      ],
    },
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
      ],
    },
    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },
    autoWatch: true,
    singleRun: false,
  });
};
