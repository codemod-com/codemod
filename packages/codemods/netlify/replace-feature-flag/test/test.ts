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
  it("Should remove type literal property in FlagDict type literal", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/typeLiteralProperty.input.ts"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/typeLiteralProperty.output.ts"),
      "utf-8",
    );

    const { actual, expected } = transform(
      INPUT,
      OUTPUT,
      "./FeatureFlagProvider.tsx",
      {
        key: "the_key",
        type: "boolean",
        value: "true",
      },
    );

    console.log(actual, "???");

    assert.deepEqual(actual, expected);
  });

  it("Should remove mockFlags from MockFeatureFlag", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/mockFlags.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/mockFlags.output.tsx"),
      "utf-8",
    );

    const { actual, expected } = transform(INPUT, OUTPUT, "./test.spec.tsx", {
      key: "the_key",
      type: "boolean",
      value: "true",
    });

    console.log(actual, "???");

    assert.deepEqual(actual, expected);
  });
});
