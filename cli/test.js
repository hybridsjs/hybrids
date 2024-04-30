import test from "node:test";
import assert from "node:assert/strict";
import { exec, execSync } from "node:child_process";
import fs from "node:fs";

test("shows default help message", () => {
  exec("node cli/index.js", (err, stdout) => {
    assert.equal(err?.code, 1);
    assert.notEqual(stdout, "");
  });
});

test("shows the extract command help message", () => {
  exec("node cli/index.js extract", (err, stdout) => {
    assert.equal(err?.code, 1);
    assert.notEqual(stdout, "");
  });
});

test("extracts translations from .js files", () => {
  const outputPath = "./cli/extract/test/output.json";
  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath);
  }
  execSync(
    "cd cli/extract/test && node ../../index.js extract --format=chrome.i18n ./src ./output.json",
  );
  const output = JSON.parse(fs.readFileSync(outputPath, { encoding: "utf-8" }));
  assert.deepEqual(output, {
    simple_text: {
      message: "simple text",
    },
    a: {
      message: "a",
    },
    b: {
      message: "b",
    },
    "@_0__a": {
      message: "$${0} a",
    },
    "@_0__b": {
      message: "$${0} b",
    },
  });
});
