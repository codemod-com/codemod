import assert from "node:assert/strict";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";

import {
  buildApi,
  buildRootCollection,
  getFunctionName,
  isFunctionExportedByDefault,
} from "#index.js";

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

      const { j, root } = buildRootCollection(fileInfo, buildApi());

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

      const { j, root } = buildRootCollection(fileInfo, buildApi());

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

      const { j, root } = buildRootCollection(fileInfo, buildApi());

      const [fn1] = root.find(j.FunctionDeclaration).paths() ?? [];
      const [fn2] = root.find(j.ArrowFunctionExpression).paths() ?? [];

      assert.ok(fn1 !== undefined);
      assert.ok(fn2 !== undefined);

      assert.ok(getFunctionName(j, fn1) === "A");
      assert.ok(getFunctionName(j, fn2) === "B");
    });
  });
});
