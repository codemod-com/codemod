import { deepStrictEqual } from "node:assert";
import { randomBytes } from "node:crypto";
import { mkdir, rmdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, it } from "vitest";

import type { ConsoleKind } from "@codemod-com/printer";
import type { CodemodConfig } from "@codemod-com/utilities";

import { runTsMorphCodemod } from "../src/engines/ts-morph.js";
import { getCodemodExecutable } from "../src/source-code.js";

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
  const codemodName = randomBytes(4).toString("hex");
  const directoryPath = join(testTempDir, codemodName);
  const distPath = join(directoryPath, "cdmd_dist");

  await mkdir(distPath, { recursive: true });
  await writeFile(join(distPath, `${codemodName}.ts`), codemodSource);

  const compiledSource = await getCodemodExecutable({
    config: {} as CodemodConfig,
    path: directoryPath,
  });

  afterAll(async () => {
    await rmdir(directoryPath);
  });

  it("should return transformed output", () => {
    const messages: [ConsoleKind, string][] = [];

    const fileCommands = runTsMorphCodemod(
      compiledSource,
      "index.ts",
      "",
      {},
      (consoleKind, message) => {
        messages.push([consoleKind, message]);
      },
    );

    deepStrictEqual(fileCommands.length, 1);

    const [fileCommand] = fileCommands;

    deepStrictEqual(fileCommand, {
      kind: "updateFile",
      oldPath: "index.ts",
      oldData: "",
      newData: "class Test {\n}\n",
    });

    deepStrictEqual(messages, [["log", "/index.ts"]]);
  });
});
