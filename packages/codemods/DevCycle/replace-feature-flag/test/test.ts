import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { join } from "node:path";
import { Project } from "ts-morph";
import { describe, it } from "vitest";
import { handleSourceFile } from "../src/index.js";

const transform = (
  beforeText: string,
  afterText: string,
  common: string,
  path: string,
) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const actualSourceFile = project.createSourceFile(path, beforeText);
  project.createSourceFile(
    join(__dirname, "..", "__testfixtures__/common.ts"),
    common,
  );

  const actual = handleSourceFile(actualSourceFile);

  console.log(actual, "????");

  const expected = project
    .createSourceFile(`expected${extname(path)}`, afterText)
    .getFullText()
    .replace(/\s/gm, "");

  return {
    actual,
    expected,
  };
};

describe("replace-feature-flag", () => {
  it("test #1", async () => {
    const COMMON = await readFile(
      join(__dirname, "..", "__testfixtures__/common.ts"),
      "utf-8",
    );

    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.output.ts"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, COMMON, "index.tsx");

    assert.deepEqual(actual, expected);
  });
});
