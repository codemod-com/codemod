import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "vitest";
import transform from "../src/index.js";

import { buildApi } from "@codemod-com/codemod-utils";

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
