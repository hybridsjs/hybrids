import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exec } from "node:child_process";

import extract from "./extract/task.js";

describe("cli command", () => {
  it("shows default help message", () => {
    exec("node cli/index.js", (err, stdout) => {
      assert.equal(err?.code, 1);
      assert.notEqual(stdout, "");
    });
  });

  it("shows the extract command help message", () => {
    exec("node cli/index.js extract", (err, stdout) => {
      assert.equal(err?.code, 1);
      assert.notEqual(stdout, "");
    });
  });
});

describe("extract task", () => {
  it("extracts messages from ternary operator with correct placeholder index", () => {
    const content =
      "const message = condition ? msg`Hello ${name}` : msg`Bye ${name}`;";
    const keys = extract(content).map(({ message }) => message);

    assert.deepEqual(keys, ["Hello ${0}", "Bye ${0}"]);
  });
});
