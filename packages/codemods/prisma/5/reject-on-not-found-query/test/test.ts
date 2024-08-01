import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, it } from "vitest";

import transform from "../src/index.js";

import { buildApi } from "@codemod-com/codemod-utils";

describe("prisma reject on not found query", () => {
  it("should remove rejectOnNotFound property and update functions name", async () => {
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
});
