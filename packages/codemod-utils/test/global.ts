import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";
import {
  addImportDeclaration,
  getImportDeclaration,
  insertStatementAfterImports,
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

describe("global utils", async () => {
  describe("getImportDeclaration", async () => {
    it("Should get import declaration if exists", async () => {
      const INPUT = `
                import React1, { Component as Component1 } from 'react';
            `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const declaration = getImportDeclaration(j, root, "react");

      assert.ok(declaration);
    });
  });

  describe("addImportDeclaration", async () => {
    it("Should add import declaration without specifiers to the beginning of Program", async () => {
      const INPUT = `
            `;

      const OUTPUT = `
            import "react";
           `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      addImportDeclaration(j, root, "react");

      const actualOutput = root.toSource();
      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("insertStatementAfterImports", async () => {
    it("Should insert statement kind to the beginning of file, after imports section", async () => {
      const INPUT = `
      import { a } from 'a';
      import B from 'b';

      export const Fn = () => {}
      `;

      const OUTPUT = `
        import { a } from 'a';
        import B from 'b';
        const a = 1;

        export const Fn = () => {}
        `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      insertStatementAfterImports(j, root, [
        j.variableDeclaration("const", [
          j.variableDeclarator(j.identifier("a"), j.identifier("1")),
        ]),
      ]);

      const actualOutput = root.toSource();
      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });
});
