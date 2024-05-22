import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type CallExpression, IndentationText, Project } from "ts-morph";
import { describe, it } from "vitest";
import { handleSourceFile } from "../src/index.js";
import type { Options, VariableType, VariableValue } from "../src/types.js";
import { buildLiteral, getCEExpressionName } from "../src/utils.js";

const transform = (
  projectFiles: Record<string, string>,
  targetPath: string,
  options: Options,
) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
    },
  });

  let transformed: string | undefined;

  Object.entries(projectFiles).forEach(([path, source]) => {
    const sourceFile = project.createSourceFile(path, source);

    if (path === targetPath) {
      transformed = handleSourceFile(sourceFile, options);
    }
  });

  return transformed;
};

const fakeProvider = {
  getMatcher: (keyName: string) => (ce: CallExpression) => {
    const name = getCEExpressionName(ce);

    if (name !== "useFlag") {
      return null;
    }

    return { name };
  },
  getReplacer: (
    key: string,
    type: VariableType,
    value: VariableValue,
    name: string,
  ) => {
    return buildLiteral(type, value);
  },
};

describe("replace-feature-flag", () => {
  it("Should refactor objects", async () => {
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/object-literal-refactor.output.ts",
      ),
      "utf-8",
    );

    const projectFiles = {
      "object-literal-refactor.input.ts": await readFile(
        join(
          __dirname,
          "..",
          "__testfixtures__/object-literal-refactor.input.ts",
        ),
        "utf-8",
      ),
    };

    const stringOptions = {
      key: "simple-case",
      type: "string",
      value: "string",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "object-literal-refactor.input.ts",
      stringOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor variable references", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/references-refactor.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "references-refactor.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/references-refactor.input.ts"),
        "utf-8",
      ),
    };

    const boolOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "references-refactor.input.ts",
      boolOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor prefix unary expressions", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/unary.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "unary.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/unary.input.ts"),
        "utf-8",
      ),
    };

    const booleanFlagOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "unary.input.ts",
      booleanFlagOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor logical expressions", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/logical-expressions.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "logical-expressions.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/logical-expressions.input.ts"),
        "utf-8",
      ),
    };

    const booleanFlagOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "logical-expressions.input.ts",
      booleanFlagOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor binary expressions", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/binary-expressions.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "binary-expressions.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/binary-expressions.input.ts"),
        "utf-8",
      ),
    };

    const booleanFlagOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "binary-expressions.input.ts",
      booleanFlagOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor if statements", async () => {
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/if-statements.output.ts"),
      "utf-8",
    );

    const projectFiles = {
      "if-statements.input.ts": await readFile(
        join(__dirname, "..", "__testfixtures__/if-statements.input.ts"),
        "utf-8",
      ),
    };

    const booleanFlagOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "if-statements.input.ts",
      booleanFlagOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });

  it("Should refactor conditional expressions", async () => {
    const OUTPUT = await readFile(
      join(
        __dirname,
        "..",
        "__testfixtures__/conditional-expressions.output.ts",
      ),
      "utf-8",
    );

    const projectFiles = {
      "conditional-expressions.input.ts": await readFile(
        join(
          __dirname,
          "..",
          "__testfixtures__/conditional-expressions.input.ts",
        ),
        "utf-8",
      ),
    };

    const booleanFlagOptions = {
      key: "simple-case",
      type: "boolean",
      value: "true",
      provider: fakeProvider,
    } as const;

    const transformed = transform(
      projectFiles,
      "conditional-expressions.input.ts",
      booleanFlagOptions,
    );

    assert.deepEqual(
      transformed?.replace(/\s/gm, ""),
      OUTPUT?.replace(/\s/gm, ""),
    );
  });
});
