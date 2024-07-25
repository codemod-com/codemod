import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";

import { getFunctionName, isFunctionExportedByDefault } from "../src/index.js";

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
  stats: () => {
    console.error(
      "The stats function was called, which is not supported on purpose",
    );
  },
  report: () => {
    console.error(
      "The report function was called, which is not supported on purpose",
    );
  },
});

const buildRootCollection = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  return { j, root };
};

describe("function utils", async () => {
  describe("isFunctionExportedByDefault", async () => {
    it("default export", async () => {
      const INPUT = `
      export default function A() {}
      export function B() {}
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const [fn1, fn2] = root.find(j.FunctionDeclaration).paths() ?? [];

      assert.ok(fn1 !== undefined);
      assert.ok(fn2 !== undefined);

      assert.ok(isFunctionExportedByDefault(j, root, fn1));
      assert.ok(!isFunctionExportedByDefault(j, root, fn2));
    });

    it("default export 2", async () => {
      const INPUT = `
      const A = () => {}
      const B = () => {}
      export default A;
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const [fn1, fn2] = root.find(j.ArrowFunctionExpression).paths() ?? [];

      assert.ok(fn1 !== undefined);
      assert.ok(fn2 !== undefined);

      assert.ok(isFunctionExportedByDefault(j, root, fn1));
      assert.ok(!isFunctionExportedByDefault(j, root, fn2));
    });
  });

  describe("getFunctionName", async () => {
    it("it should correctly find functionName", async () => {
      const INPUT = `
        function A() {}
        const B = () => {}
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const [fn1] = root.find(j.FunctionDeclaration).paths() ?? [];
      const [fn2] = root.find(j.ArrowFunctionExpression).paths() ?? [];

      assert.ok(fn1 !== undefined);
      assert.ok(fn2 !== undefined);

      assert.ok(getFunctionName(j, fn1) === "A");
      assert.ok(getFunctionName(j, fn2) === "B");
    });
  });
});
