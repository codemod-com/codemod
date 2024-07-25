import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";

import {
  getCallExpressionsByImport,
  getCalleeName,
  getImportDeclaration,
  isCallExpressionLibraryMethod,
} from "../src/index.js";

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

describe("call expression utils", async () => {
  describe("getCalleeName", async () => {
    it("Should properly get callee name if callee is identifier or member expression", async () => {
      const INPUT = `
      a.b.c.d();
      d();
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const [ce1, ce2] = root.find(j.CallExpression).paths() ?? [];

      assert.ok(getCalleeName(j, ce1?.value.callee!) === "a");
      assert.ok(getCalleeName(j, ce2?.value.callee!) === "d");
    });
  });

  describe("getCallExpressionsByImport", async () => {
    it("Should properly get all call expressions where callee is imported form specified import declaration", async () => {
      const INPUT = `
      import { a, b as balias, c } from 'react';
       a();
       c.d.e();
       balias.method();
       b();
       d();
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "react");
      const res = getCallExpressionsByImport(j, root, importDeclaration!);

      assert.deepStrictEqual(
        res.paths().map(({ value }) => j(value.callee).toSource()),
        ["a", "c.d.e", "balias.method"],
      );
    });
  });

  describe("isCallExpressionLibraryMethod", async () => {
    it("Should correctly check if expression is a library method", async () => {
      const INPUT = `
      import A, { a, knownMethod1 as alias1, knownMethod2 as alias2 } from 'react';
       A(); // false
       A.knownMethod1(); // ok
       A.something(); // false
       A.knownMethod.something(); // false

       alias1(); // ok
       A.alias1(); // false
       knownMethod1(); // false
       knownMethod2(); // false
       alias2(); //ok
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "react");
      const res = root
        .find(j.CallExpression)
        .filter((cellExpression) =>
          isCallExpressionLibraryMethod(j, cellExpression, importDeclaration!, [
            "knownMethod1",
            "knownMethod2",
          ]),
        );

      assert.deepStrictEqual(
        res.paths().map(({ value }) => j(value.callee).toSource()),
        ["A.knownMethod1", "alias1", "alias2"],
      );
    });
  });
});
