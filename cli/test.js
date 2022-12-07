import test from "node:test";
import assert from "node:assert/strict";
import { exec } from "node:child_process";

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
