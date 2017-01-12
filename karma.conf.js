const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    frameworks: ['jasmine'],
    reporters: ['progress', 'coverage'],
    browsers: process.env.TRAVIS ? ['ChromeTravis'] : ['Chrome'],
    files: ['test/unit.js'],
    preprocessors: {
      'test/unit.js': ['webpack', 'sourcemap'],
    },
    webpack: Object.assign({}, webpackConfig, {
      devtool: 'inline-source-map',
      entry: undefined,
    }),
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
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
