import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("netlify 0.8.1 addBuildEventContext", () => {
  it("changes addBuildContext to addBuildEventContext", () => {
    const INPUT = `
			integration.addBuildContext("onPreBuild", () => {
				//FOO
			});
        `;

    const OUTPUT = `
			integration.addBuildEventContext("onPreBuild", () => {
				//FOO
			});
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
