import { deepEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
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

  const api = buildApi<{ jscodeshift: typeof jscodeshift }>(
    unifiedFileSystem,
    () => ({ jscodeshift }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {}, null);
};

describe("prisma tests", async () => {
  const schemaPath = "/opt/project/schema.prisma";
  const schemaContent = `
    model User {
      id Int @id

      addressId Int     @unique
      address   Address @relation(fields: [addressId], references: [id])

      post Post[]
    }

    model Address {
      id Int @id

      user User?
    }

    model Post {
      id Int @id

      userId Int
      user   User @relation(fields: [userId], references: [id])
    }
  `;

  const example1Path = "/opt/project/example1.ts";
  const example1Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture1.input.ts"),
    "utf-8",
  );

  it("should contain correct file commands", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example1Path]: example1Content,
    });

    deepEqual(externalFileCommands.length, 1);

    ok(
      externalFileCommands.filter(
        (command) =>
          command.kind === "upsertFile" && command.path === example1Path,
      ).length === externalFileCommands.length,
    );
  });

  it("should correctly modify example in fixture #1", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example1Path]: example1Content,
    });

    const example1Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example1Path,
    );

    ok(example1Command);
    ok(example1Command.kind === "upsertFile");
    const example1Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture1.output.ts"),
      "utf-8",
    );
    deepEqual(example1Command.data, example1Fixture);
  });
});
