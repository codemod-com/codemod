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

describe("remove-legacy-context", () => {
  it("should remove getChildContext and childContextTypes from parent component", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/class-component.input.tsx"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/class-component.output.tsx"),
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
