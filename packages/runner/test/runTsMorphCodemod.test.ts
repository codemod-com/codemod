import { deepStrictEqual } from "node:assert";
import { randomBytes } from "node:crypto";
import { mkdir, rmdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, it } from "vitest";

import type { CodemodConfigInput } from "@codemod-com/utilities";
import { runTsMorphCodemod } from "../src/engines/ts-morph.js";
import { getCodemodExecutable, getTransformer } from "../src/source-code.js";

const codemodSource = `
import { SourceFile, EmitHint } from 'ts-morph';

export const handleSourceFile = (
    sourceFile: SourceFile,
): string | undefined => {
	console.log(sourceFile.getFilePath())

    sourceFile.addClass({
        name: 'Test'
    })

    return sourceFile.print({ emitHint: EmitHint.SourceFile });
};
`;

const testTempDir = join(homedir(), ".codemod", "test-temp");

describe("runTsMorphCodemod", async () => {
  const codemodName = randomBytes(8).toString("hex");
  const directoryPath = join(testTempDir, codemodName);
  const srcPath = join(directoryPath, "src");

  await mkdir(srcPath, { recursive: true });
  await writeFile(join(srcPath, "index.ts"), codemodSource);
  await writeFile(
    join(directoryPath, ".codemodrc.json"),
    JSON.stringify({
      name: "test",
      engine: "ts-morph",
      version: "0.0.0",
    } satisfies CodemodConfigInput),
  );

  const compiledSource = await getCodemodExecutable(directoryPath);
  const transformer = getTransformer(compiledSource);

  afterAll(async () => {
    await rmdir(directoryPath, { recursive: true });
  });

  it("should return transformed output", () => {
    const fileCommands = runTsMorphCodemod(transformer!, "index.ts", "", {});

    deepStrictEqual(fileCommands.length, 1);

    const [fileCommand] = fileCommands;

    deepStrictEqual(fileCommand, {
      kind: "updateFile",
      oldPath: "index.ts",
      oldData: "",
      newData: "class Test {\n}\n",
    });
  });
});
