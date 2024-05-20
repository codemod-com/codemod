import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { IndentationText, Project } from "ts-morph";
import { describe, it } from "vitest";
import { type Options, handleSourceFile } from "../src/index.js";

const transform = (
  projectFiles: Record<string, string>,
  targetPath: string,
  options: Options,
) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
    },
  });

  let transformed: string | undefined;

  Object.entries(projectFiles).forEach(([path, source]) => {
    const sourceFile = project.createSourceFile(path, source);

    if (path === targetPath) {
      transformed = handleSourceFile(sourceFile, options);
    }
  });

  return transformed;
};

describe("replace-feature-flag", () => {
  it("Should replace sdk method call with its return value", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/simple-string.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "shared.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/shared.ts"),
        "utf-8",
      ),
      "simple-string.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/simple-string.input.ts"),
        "utf-8",
      ),
    };

    const stringOptions = {
      key: "simple-case",
      type: "String",
      value: "string",
    } as const;

    const transformed = transform(
      projectFiles,
      "simple-string.input.ts",
      stringOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor objects", async () => {
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/object-literal-refactor.output.ts",
      ),
      "utf-8",
    );

    const projectFiles = {
      "object-literal-refactor.input.ts": await readFile(
        join(
          __dirname,
          "..",
          "__testfixtures__/object-literal-refactor.input.ts",
        ),
        "utf-8",
      ),
    };

    const stringOptions = {
      key: "simple-case",
      type: "String",
      value: "string",
    } as const;

    const transformed = transform(
      projectFiles,
      "object-literal-refactor.input.ts",
      stringOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it.only("Should refactor references", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/references-refactor.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "references-refactor.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/references-refactor.input.ts"),
        "utf-8",
      ),
    };

    const stringOptions = {
      key: "simple-case",
      type: "String",
      value: "string",
    } as const;

    const transformed = transform(
      projectFiles,
      "references-refactor.input.ts",
      stringOptions,
    );

    console.log(transformed, "???");
    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });
});
