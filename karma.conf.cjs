const playwright = require("playwright");

process.env.WEBKIT_HEADLESS_BIN = playwright.webkit.executablePath();
const IS_COVERAGE = process.env.NODE_ENV === "coverage";

module.exports = (config) => {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    reporters: IS_COVERAGE ? ["coverage"] : ["dots"],
    browsers: IS_COVERAGE
      ? ["ChromeHeadless"]
      : ["ChromeHeadless", "WebkitHeadless", "FirefoxHeadless"],
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
        { type: "html", subdir: "." },
        { type: "lcovonly", subdir: ".", file: "lcov.info" },
      ],
    },
    autoWatch: true,
    singleRun: true,
    port: 9876 + Number(IS_COVERAGE),
  });
};
