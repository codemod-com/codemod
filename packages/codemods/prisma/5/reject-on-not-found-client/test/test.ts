import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, it } from "vitest";

import transform from "../src/index.js";

import { buildApi } from "@codemod-com/codemod-utils";

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
