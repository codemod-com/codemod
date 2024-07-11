import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { Project } from "ts-morph";
import { describe, it } from "vitest";
import { handleSourceFile } from "../src/index.js";

const transform = (beforeText: string, afterText: string, path: string) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const actualSourceFile = project.createSourceFile(path, beforeText);

  const actual = handleSourceFile(actualSourceFile)?.replace(/\s/gm, "");

  const expected = project
    .createSourceFile(`expected${extname(path)}`, afterText)
    .getFullText()
    .replace(/\s/gm, "");

  return {
    actual,
    expected,
  };
};

describe("Replace feature flag", () => {
  it("Should replace the body correctly given a generic type is provided", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.output.ts"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, "index.tsx");

    assert.deepEqual(actual, expected);
  });

  it("Should replace the body with cookies", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.output.ts"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, "index.tsx");

    assert.deepEqual(actual, expected);
  });

  it("Should correctly place the delay function", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture3.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture3.output.ts"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, "index.tsx");

    assert.deepEqual(actual, expected);
  });
});
