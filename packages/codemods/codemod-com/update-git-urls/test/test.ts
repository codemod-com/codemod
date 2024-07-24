import { deepEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";

import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi(unifiedFileSystem, () => ({}), pathApi);

  return executeFilemod(api, repomod, "/", {}, {}, null);
};

describe("fill git urls codemod tests", async () => {
  it("should correctly modify example in fixture #1", async () => {
    const examplePath =
      "/Users/codemod/projects/codemod/packages/codemods/codemod-com/update-git-urls/__testfixtures__/.codemodrc.json";

    const example1Content = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture1.input.json"),
      "utf-8",
    );

    const externalFileCommands = await transform({
      [examplePath]: example1Content,
    });

    const example1Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === examplePath,
    );

    ok(example1Command);
    ok(example1Command.kind === "upsertFile");
    const example1Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture1.output.json"),
      "utf-8",
    );
    deepEqual(example1Command.newData, example1Fixture);
  });

  it("should correctly modify example in fixture #2", async () => {
    const examplePath =
      "/Users/codemod/projects/codemod/packages/codemods/codemod-com/update-git-urls/__testfixtures__/.codemodrc.json";

    const example2Content = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture2.input.json"),
      "utf-8",
    );

    const externalFileCommands = await transform({
      [examplePath]: example2Content,
    });

    const example2Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === examplePath,
    );

    ok(example2Command);
    ok(example2Command.kind === "upsertFile");
    const example2Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture2.output.json"),
      "utf-8",
    );
    deepEqual(example2Command.newData, example2Fixture);
  });
});
