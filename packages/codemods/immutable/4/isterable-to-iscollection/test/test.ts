import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("immutable-4 isiterable-to-iscollection", () => {
  it("should change the isIterable identifier into the isCollection identifier", () => {
    const INPUT = `
            Immutable.Iterable.isIterable();
        `;

    const OUTPUT = `
            Immutable.Iterable.isCollection()
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
