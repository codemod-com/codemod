import { deepStrictEqual } from "node:assert";
import { randomBytes } from "node:crypto";
import { mkdir, rmdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, it } from "vitest";

import type { CodemodConfigInput } from "@codemod-com/utilities";
import { runJscodeshiftCodemod } from "../src/engines/jscodeshift.js";
import { getCodemodExecutable, getTransformer } from "../src/source-code.js";

const codemodSource = `
import type { FileInfo, API, Options } from 'jscodeshift';

// this is the entry point for a JSCodeshift codemod
export default function transform(
    file: FileInfo,
    api: API,
    options: Options,
): string | undefined {
    console.log(file.path);

    const j = api.jscodeshift;
    const root = j(file.source);

    root.find(j.FunctionDeclaration, {
        id: {
            name: 'mapStateToProps',
            type: 'Identifier',
        },
    }).forEach((functionDeclarationPath) => {
        if (functionDeclarationPath.value.params.length === 0) {
            return;
        }

        const collection = j(functionDeclarationPath);
        collection.forEach((astPath) => {
            const patternKind = astPath.value.params[0];
            if (patternKind?.type !== 'Identifier') {
                return;
            }
            const identifierPathCollection = j(astPath).find(j.Identifier, {
                name: patternKind.name,
            });
            const typeAnnotation = j.typeAnnotation(
                j.genericTypeAnnotation(j.identifier('State'), null),
            );

            identifierPathCollection.paths()[0]?.replace(
                j.identifier.from({
                    comments: patternKind.comments ?? null,
                    name: patternKind.name,
                    optional: patternKind.optional,
                    typeAnnotation: typeAnnotation,
                }),
            );
        });
    });

    return root.toSource();
}
`;

const testTempDir = join(homedir(), ".codemod", "test-temp");

describe("runJscodeshiftCodemod", async () => {
  const codemodName = randomBytes(8).toString("hex");
  const directoryPath = join(testTempDir, codemodName);
  const srcPath = join(directoryPath, "src");

  await mkdir(srcPath, { recursive: true });
  await writeFile(join(srcPath, "index.ts"), codemodSource);
  await writeFile(
    join(directoryPath, ".codemodrc.json"),
    JSON.stringify({
      name: "test",
      engine: "jscodeshift",
      version: "0.0.0",
    } satisfies CodemodConfigInput),
  );

  const compiledSource = await getCodemodExecutable(directoryPath);
  const transformer = getTransformer(compiledSource);

  afterAll(async () => {
    await rmdir(directoryPath, { recursive: true });
  });

  it("should return transformed output", () => {
    const oldData = "function mapStateToProps(state) {}";

    const fileCommands = runJscodeshiftCodemod(
      transformer!,
      "/index.ts",
      oldData,
      {},
      null,
    );

    deepStrictEqual(fileCommands.length, 1);

    const [fileCommand] = fileCommands;

    const newData = "function mapStateToProps(state: State) {}";

    deepStrictEqual(fileCommand, {
      kind: "updateFile",
      oldPath: "/index.ts",
      oldData,
      newData,
    });
  });
});
