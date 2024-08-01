import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "vitest";
import transform from "../src/index.js";

import { buildApi } from "@codemod-com/codemod-utils";

describe("react/19/replace-string-ref", () => {
  it("Should replace string refs in class components: default import", async () => {
    const INPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-default-import.input.tsx",
      ),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-default-import.output.tsx",
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
      actualOutput?.replace(/\s/gm, ""),
      OUTPUT.replace(/\s/gm, ""),
    );
  });

  it("Should replace string refs in class components: named import", async () => {
    const INPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-named-import.input.tsx",
      ),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-named-import.output.tsx",
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
      actualOutput?.replace(/\s/gm, ""),
      OUTPUT.replace(/\s/gm, ""),
    );
  });

  it("Should replace string refs in class components: custom import names", async () => {
    const INPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-custom-import-names.input.tsx",
      ),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/class-component-custom-import-names.output.tsx",
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
      actualOutput?.replace(/\s/gm, ""),
      OUTPUT.replace(/\s/gm, ""),
    );
  });

  it("Should ignore functional components", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/function-component.input.tsx"),
      "utf-8",
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
    );

    assert.deepEqual(actualOutput, undefined);
  });
});
