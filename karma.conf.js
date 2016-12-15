const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    basePath: process.cwd(),
    frameworks: ['jasmine'],
    files: ['test/unit.js'],
    exclude: [],
    preprocessors: {
      'test/unit.js': ['webpack', 'sourcemap'],
    },
    webpack: Object.assign({}, webpackConfig, {
      devtool: 'inline-source-map',
      entry: undefined,
      eslint: {
        configFile: './.eslintrc',
      },
      webpackServer: {
        noInfo: true,
      },
    }),
    webpackMiddleware: {
      stats: 'errors-only',
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
  });
};
