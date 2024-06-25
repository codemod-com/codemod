import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import jscodeshift, { type API } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

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

describe("react/19/replace-default-props", () => {
  it("should correctly transform single default prop", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/single-default-prop.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/single-default-prop.output.tsx"),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });

  it("should correctly transform multiple default props", async () => {
    const INPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/multiple-default-props.input.tsx",
      ),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/multiple-default-props.output.tsx",
      ),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });

  it("should correctly transform nested default props", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/nested-destructuring.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/nested-destructuring.output.tsx"),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });

  it("should correctly transform default props with functions", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/with-functions.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/with-functions.output.tsx"),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });

  it("should correctly transform when props have rest prop", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/with-rest-props.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/with-rest-props.output.tsx"),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });

  it("should correctly transform when props are not destructured", async () => {
    const INPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/props-not-destructured.input.tsx",
      ),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/props-not-destructured.output.tsx",
      ),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ""),
      OUTPUT.replace(/W/gm, ""),
    );
  });
});
