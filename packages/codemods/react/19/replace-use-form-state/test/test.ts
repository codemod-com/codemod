import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import jscodeshift, { type API, type FileInfo } from "jscodeshift";
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

describe("react/19/replace-use-form-state: useFormState() -> useActionState()", () => {
  it("should replace direct import with new useActionState import", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace ReactDOM.useFormState with ReactDOM.useActionState", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture2.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should properly replace star import", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture3.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture3.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should not replace other imports react-dom", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture4.input.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(actualOutput, undefined);
  });

  it("should add useActionState import in existing import clause if other imports are present", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture5.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture5.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should correctly work with aliased imports", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture6.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture6.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should correctly transform useFormState import to useActionState", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture7.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture7.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should correctly transform import all from ReactDOM", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture8.input.js"),
      "utf-8",
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture8.output.js"),
      "utf-8",
    );

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
