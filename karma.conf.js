const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    basePath: process.cwd(),
    frameworks: ['jasmine'],
    files: [
      // './node_modules/core-js/client/shim.js',
      // './node_modules/webcomponents.js/src/Template/Template.js',
      // './node_modules/@webcomponents/custom-elements/custom-elements.min.js',
      // './node_modules/@webcomponents/shadydom/shadydom.min.js',
      'packages/*/test/**/*.js',
    ],
    exclude: [],
    preprocessors: {
      'packages/*/test/**/*.js': ['webpack', 'sourcemap'],
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
