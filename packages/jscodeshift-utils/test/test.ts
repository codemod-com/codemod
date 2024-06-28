import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";
import { describe, it } from "vitest";
import { addNamedImport } from "../src/index.js";

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

describe("import utils", async () => {
  it("add named import 1", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/import-add-1.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/import-add-1.output.ts"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

    addNamedImport(j, root, "a", "import-name");
    addNamedImport(j, root, "a", "import-name");
    addNamedImport(j, root, "b", "import-name1");
    addNamedImport(j, root, "c", "import-name2");

    const actualOutput = root.toSource();

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
