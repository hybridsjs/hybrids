// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");

const IS_COVERAGE = process.env.NODE_ENV === "coverage";
const IS_SAUCE_LABS =
  !!process.env.TRAVIS &&
  process.env.TRAVIS_BRANCH === "master" &&
  process.env.TRAVIS_PULL_REQUEST === "false";

const customLaunchers = {
  SL_Chrome: {
    base: "SauceLabs",
    browserName: "chrome",
    platform: "Windows 10",
    version: "latest",
  },
  SL_Chrome_1: {
    base: "SauceLabs",
    browserName: "chrome",
    platform: "Windows 10",
    version: "latest-1",
  },
  SL_Firefox: {
    base: "SauceLabs",
    browserName: "firefox",
    platform: "Windows 10",
    version: "latest",
  },
  SL_Firefox_1: {
    base: "SauceLabs",
    browserName: "firefox",
    platform: "Windows 10",
    version: "latest-1",
  },
  SL_Safari: {
    base: "SauceLabs",
    browserName: "safari",
    platform: "macOS 10.13",
    version: "latest",
  },
  SL_Safari_1: {
    base: "SauceLabs",
    browserName: "safari",
    platform: "macOS 10.13",
    version: "latest-1",
  },
  SL_IE_11: {
    base: "SauceLabs",
    browserName: "internet explorer",
    platform: "Windows 8.1",
    version: "11",
  },
  SL_EDGE: {
    base: "SauceLabs",
    browserName: "microsoftedge",
    platform: "Windows 10",
    version: "latest",
  },
  SL_EDGE_1: {
    base: "SauceLabs",
    browserName: "microsoftedge",
    platform: "Windows 10",
    version: "latest-1",
  },
  SL_iOS: {
    base: "SauceLabs",
    browserName: "iphone",
    platform: "macOS 10.13",
    version: "latest",
  },
  SL_iOS_1: {
    base: "SauceLabs",
    browserName: "iphone",
    platform: "macOS 10.13",
    version: "latest-1",
  },
};

const reporters = ["dots"];

if (IS_COVERAGE) reporters.push("coverage");
if (IS_SAUCE_LABS) reporters.push("saucelabs");

module.exports = config => {
  config.set({
    frameworks: ["jasmine"],
    reporters,
    browsers: IS_SAUCE_LABS
      ? Object.keys(customLaunchers)
      : ["ChromeHeadless", "FirefoxHeadless"],
    files: [
      "node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js",
      "test/runner.js",
    ],
    preprocessors: {
      "test/runner.js": ["webpack", "sourcemap"],
    },
    webpack: {
      module: {
        ...webpackConfig.module,
      },
      devtool: "inline-source-map",
      mode: "development",
      plugins: [
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": "env",
        }),
      ],
    },
    webpackMiddleware: {
      noInfo: true,
      stats: "errors-only",
    },
    coverageReporter: {
      dir: "coverage/",
      reporters: [
        { type: "html", subdir: "report-html" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" },
      ],
    },
    captureTimeout: 120000,
    browserNoActivityTimeout: 300000,
    browserDisconnectTolerance: 2,
    customLaunchers,
    sauceLabs: {
      testName: "Hybrids Unit Tests",
      build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    },
    autoWatch: true,
    singleRun: false,
  });
};
