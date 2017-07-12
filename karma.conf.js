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
    webpack: Object.assign({}, webpackConfig, {
      devtool: 'inline-source-map',
      entry: undefined,
    }),
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
