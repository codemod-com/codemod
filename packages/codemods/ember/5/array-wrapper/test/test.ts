import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 array-wrapper", () => {
  it("basic", () => {
    const INPUT = `
		import { A } from '@ember/array';
        let arr = new A();
		`;

    const OUTPUT = `
		import { A as emberA } from '@ember/array';
        let arr = A();
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
