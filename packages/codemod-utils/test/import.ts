import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";

import {
  addNamedImports,
  getImportDeclaration,
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
  describe("addNamedImports", () => {
    // it("should create new ImportDeclaration if it does not exist", async () => {
    //   const INPUT = ``;
    //   const OUTPUT = `import { a } from 'import-name';`;

    //   const fileInfo: FileInfo = {
    //     path: "index.js",
    //     source: INPUT,
    //   };

    //   const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

    //   const importDeclaration = getImportDeclaration(j, root, "import-name");
    //   addNamedImports(j, ["a"], importDeclaration!);

    //   const actualOutput = root.toSource();

    //   assert.deepEqual(
    //     actualOutput?.replace(/\W/gm, ""),
    //     OUTPUT.replace(/\W/gm, ""),
    //   );
    // });

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
