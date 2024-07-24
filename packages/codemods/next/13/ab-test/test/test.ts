import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import jscodeshift from "jscodeshift";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);
  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{
    jscodeshift: typeof jscodeshift;
    j: typeof jscodeshift;
  }>(unifiedFileSystem, () => ({ jscodeshift, j: jscodeshift }), pathApi);

  return executeFilemod(api, repomod, "/", {}, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

const removeWhitespaces = (
  command: ExternalFileCommand,
): ExternalFileCommand => {
  if (command.kind !== "upsertFile") {
    return command;
  }

  return {
    ...command,
    oldData: command.oldData.replace(/\s/gm, ""),
    newData: command.newData.replace(/\s/gm, ""),
  };
};

describe("ab-test", () => {
  it("should build correct files", async () => {
    const oldContent = `
      const middleware = async () => {};
      export default middleware;
    `;
    const [middlewareTsCommand, abTestMiddlewareTsCommand] = await transform({
      "/opt/project/middleware.ts": oldContent,
    });

    deepStrictEqual(
      removeWhitespaces(middlewareTsCommand!),
      removeWhitespaces({
        kind: "upsertFile",
        path: "/opt/project/middleware.ts",
        oldData: oldContent,
        newData: `
			import { abTestMiddlewareFactory } from "abTestMiddlewareFactory";
			const middleware = async () => {};
			export default abTestMiddlewareFactory(middleware);
			`,
      }),
    );

    deepStrictEqual(abTestMiddlewareTsCommand?.kind, "upsertFile");
    deepStrictEqual(
      abTestMiddlewareTsCommand.path,
      "/opt/project/abTestMiddlewareFactory.ts",
    );
  });
});
