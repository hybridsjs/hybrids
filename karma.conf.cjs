const IS_COVERAGE = process.env.NODE_ENV === "coverage";
const IS_SAUCE_LABS =
  !IS_COVERAGE &&
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
    platform: "macOS 11.00",
    version: "latest",
  },
  SL_Safari_1: {
    base: "SauceLabs",
    browserName: "safari",
    platform: "macOS 10.15",
    version: "latest",
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
    platform: "macOS 11.00",
    version: "latest",
  },
  SL_iOS_1: {
    base: "SauceLabs",
    browserName: "iphone",
    platform: "macOS 11.00",
    version: "latest-1",
  },
};

const reporters = ["dots"];

if (IS_COVERAGE) reporters.push("coverage");
if (IS_SAUCE_LABS) reporters.push("saucelabs");

module.exports = config => {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    reporters,
    browsers: IS_SAUCE_LABS ? Object.keys(customLaunchers) : ["ChromeHeadless"],
    files: [
      { pattern: "src/**/*.js", type: "module" },
      { pattern: "test/**/*.js", type: "module" },
    ],
    preprocessors: {
      "src/**/*.js": IS_COVERAGE ? ["coverage"] : [],
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
