import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";

import {
  addNamedImports,
  getDefaultImport,
  getImportDeclaration,
  getNamedImport,
  getNamespaceImport,
  removeNamedImports,
  renameDefaultImport,
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

describe("Import utils", async () => {
  describe("getNamedImport", () => {
    it("Should get named import by imported name", async () => {
      const INPUT = `import { a, c as d } from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      // imported without alias - ok
      const node1 = getNamedImport(j, importDeclaration!, "a");
      // not imported - null
      const node2 = getNamedImport(j, importDeclaration!, "b");
      // d is local name (alias) - null
      const node3 = getNamedImport(j, importDeclaration!, "d");
      // c is imported name - ok
      const node4 = getNamedImport(j, importDeclaration!, "c");

      assert.ok(node1);
      assert.ok(node4);
      assert.ok(!node2);
      assert.ok(!node3);
    });
  });

  describe("getDefaultImport", () => {
    it("Should get default import", async () => {
      const INPUT = `import A from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const node1 = getDefaultImport(j, importDeclaration!);
      assert.ok(node1?.type === "ImportDefaultSpecifier");
    });
  });

  describe("getNamespaceImport", () => {
    it("Should get default import", async () => {
      const INPUT = `import * as A from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const node1 = getNamespaceImport(j, importDeclaration!);
      assert.ok(node1?.type === "ImportNamespaceSpecifier");
    });
  });

  describe("addNamedImports", () => {
    it("should not duplicate named imports", async () => {
      const INPUT = `import { a } from 'import-name';`;
      const OUTPUT = `import { a, b } from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      addNamedImports(j, ["a", "b"], importDeclaration!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("removeNamedImport", () => {
    it("should remove ImportDeclaration if no specifiers left after removal", async () => {
      const INPUT = `
      import { a } from 'import-name';
      import b, { c } from 'import-name1';
      import { type d, f } from 'import-name2';
      `;

      const OUTPUT = `
      import b from 'import-name1';
      import { type d } from 'import-name2'; 
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const importDeclaration1 = getImportDeclaration(j, root, "import-name1");
      const importDeclaration2 = getImportDeclaration(j, root, "import-name2");
      removeNamedImports(j, ["a"], importDeclaration!);
      removeNamedImports(j, ["c"], importDeclaration1!);
      removeNamedImports(j, ["f"], importDeclaration2!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("renameDefaultImport", () => {
    it("should rename default import of the ImportDeclaration", async () => {
      const INPUT = `
      import A, { a } from 'import-name';
      `;

      const OUTPUT = `
      import B, { a } from 'import-name';
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      renameDefaultImport(j, "B", importDeclaration!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });
});
