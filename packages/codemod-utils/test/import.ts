import assert from "node:assert/strict";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";

import {
  addNamedImports,
  buildApi,
  buildRootCollection,
  getDefaultImport,
  getImportDeclaration,
  getImportDeclarationNames,
  getNamedImport,
  getNamedImportLocalName,
  getNamespaceImport,
  importDeclarationHasLocalName,
  removeNamedImports,
  removeNamespaceImport,
  removeUnusedSpecifiers,
  renameDefaultImport,
} from "#index.js";

describe("Import utils", async () => {
  describe("getNamedImport", () => {
    it("Should get named import by imported name", async () => {
      const INPUT = `import { a, c as d } from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
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
    it("Should get default import node", async () => {
      const INPUT = `import A from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const node1 = getDefaultImport(j, importDeclaration!);
      assert.ok(node1?.type === "ImportDefaultSpecifier");
    });
  });

  describe("getNamespaceImport", () => {
    it("Should get namespace import node", async () => {
      const INPUT = `import * as A from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const node1 = getNamespaceImport(j, importDeclaration!);
      assert.ok(node1?.type === "ImportNamespaceSpecifier");
    });
  });

  describe("renameDefaultImport", () => {
    it("Should rename default import of the import declaration", async () => {
      const INPUT = `import A from 'import-name';`;
      const OUTPUT = `import B from 'import-name';`;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      renameDefaultImport(j, "B", importDeclaration!);
      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
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

      const { j, root } = buildRootCollection(fileInfo, buildApi());
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

      const { j, root } = buildRootCollection(fileInfo, buildApi());
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

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      renameDefaultImport(j, "B", importDeclaration!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("removeNamespaceImport", () => {
    it("should remove namespace import of the ImportDeclaration", async () => {
      const INPUT = `
     import A, * as B from "import-name";
      `;

      const OUTPUT = `
      import A from 'import-name';
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      removeNamespaceImport(j, importDeclaration!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("removeUnusedSpecifiers", () => {
    it("should remove identifiers that are not present in the whole AST tree (naive check, does not takes scopes into account)", async () => {
      const INPUT = `
     import A, { a, b, c } from "import-name";
     console.log(c);
      `;

      const OUTPUT = `
       import { c } from "import-name";
       console.log(c);
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      removeUnusedSpecifiers(j, root, importDeclaration!);

      const actualOutput = root.toSource();

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("getImportDeclarationNames", () => {
    it("Should get names (local names) of the identifiers that are imported from given import declaration", async () => {
      const INPUT = `
     import A, { a, b as aliasb, c } from "import-name";
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const names = getImportDeclarationNames(j, importDeclaration!);

      assert.deepEqual(
        [...names.importSpecifierLocalNames.entries()],
        [
          ["a", "a"],
          ["b", "aliasb"],
          ["c", "c"],
        ],
      );

      assert.ok(names.importDefaultSpecifierName === "A");
    });
  });

  describe("importDeclarationHasLocalName", () => {
    it("Should check if import declaration has the local name", async () => {
      const INPUT = `
     import A, { a, b as aliasb, c as d } from "import-name";
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const hasAliasb = importDeclarationHasLocalName(
        j,
        "aliasb",
        importDeclaration!,
      );
      const hasC = importDeclarationHasLocalName(j, "c", importDeclaration!);

      assert.ok(hasAliasb);
      assert.ok(!hasC);
    });
  });

  describe("getNamedImportLocalName", () => {
    it("Should check if import declaration has the local name", async () => {
      const INPUT = `
     import A, { a, b as aliasb, c as d } from "import-name";
      `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi());
      const importDeclaration = getImportDeclaration(j, root, "import-name");
      const local = getNamedImportLocalName(j, "b", importDeclaration!);

      assert.ok(local === "aliasb");
    });
  });
});
