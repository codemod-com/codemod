import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { Project } from "ts-morph";
import { describe, it } from "vitest";
import type { Options } from "../../../replace-feature-flag-core/src/types.js";
import { handleSourceFile } from "../src/index.js";

const transform = (
  beforeText: string,
  afterText: string,
  path: string,
  options: Omit<Options, "provider">,
) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const actualSourceFile = project.createSourceFile(path, beforeText);

  const actual = handleSourceFile(actualSourceFile, options)?.replace(
    /\s/gm,
    "",
  );

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
  it.todo("Should replace feature flag with boolean value", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/netlify.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/netlify.output.js"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, "index.tsx", {
      key: "simple-case",
      type: "boolean",
      value: "true",
    });

    assert.deepEqual(actual, expected);
  });
});
