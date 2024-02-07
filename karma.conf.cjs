const playwright = require("playwright");

process.env.WEBKIT_HEADLESS_BIN = playwright.webkit.executablePath();
process.env.FIREFOX_BIN = playwright.firefox.executablePath();

const IS_COVERAGE = process.env.NODE_ENV === "coverage";

module.exports = (config) => {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    reporters: ["dots"].concat(IS_COVERAGE ? ["coverage"] : []),
    browsers: IS_COVERAGE
      ? ["ChromeHeadless"]
      : ["WebkitHeadless", "ChromeHeadless", "FirefoxHeadless"],
    client: {
      captureConsole: false,
      jasmine: {
        timeoutInterval: 10000,
        random: false,
      },
    },
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
        { type: "html", subdir: "html" },
        { type: "lcovonly", subdir: "lcov", file: "lcov.info" },
      ],
    },
    autoWatch: true,
    singleRun: true,
    concurrency: Infinity,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    port: 9876 + Number(IS_COVERAGE),
  });
};
