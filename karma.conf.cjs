const IS_COVERAGE = process.env.NODE_ENV === "coverage";
const reporters = ["dots"];

if (IS_COVERAGE) reporters.push("coverage");

module.exports = (config) => {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    reporters,
    browsers: ["ChromeHeadless"],
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
    singleRun: false,
  });
};
