import jscodeshift, { type API } from "jscodeshift";

import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

describe("prisma reject on not found client", () => {
  it("should remove rejectOnNotFound property from client and update all functions name", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.input.ts"),
      "utf-8",
    );

    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.output.ts"),
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

  it("should remove rejectOnNotFound object with findUnique: true from client and update findUnique functions name", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.input.ts"),
      "utf-8",
    );

    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.output.ts"),
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

  it("should remove rejectOnNotFound object with findFirst: true from client and update findFirst functions name", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.input.ts"),
      "utf-8",
    );

    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.output.ts"),
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
