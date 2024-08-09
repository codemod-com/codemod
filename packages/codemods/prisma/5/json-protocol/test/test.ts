import { deepEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultJSCodeshiftParser } from "@codemod-com/codemod-utils";
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
  }>(
    unifiedFileSystem,
    () => ({
      jscodeshift,
      j: jscodeshift.withParser(defaultJSCodeshiftParser),
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {}, null);
};

describe("prisma json protocol tests", async () => {
  const schemaPath = "/opt/project/schema.prisma";
  const schemaContent = `
    model Post {
      id           String    @id @default(uuid())
      commentsList Comment[]
      tags String[]
    }

    type Comment {
      text String
    }

    model User {
      id       String  @id @default(uuid())
      settings Json
      posts    Post[]
    }
  `;

  const example1Path = "/opt/project/example1.ts";
  const example1Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture1.input.ts"),
    "utf-8",
  );

  const example2Path = "/opt/project/example2.ts";
  const example2Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture2.input.ts"),
    "utf-8",
  );

  const example3Path = "/opt/project/example3.ts";
  const example3Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture3.input.ts"),
    "utf-8",
  );

  const example4Path = "/opt/project/example4.ts";
  const example4Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture4.input.ts"),
    "utf-8",
  );

  const example5Path = "/opt/project/example5.ts";
  const example5Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture5.input.ts"),
    "utf-8",
  );

  const example6Path = "/opt/project/example6.ts";
  const example6Content = await readFile(
    join(__dirname, "..", "__testfixtures__", "fixture6.input.ts"),
    "utf-8",
  );

  it("should contain correct file commands", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example1Path]: example1Content,
      [example2Path]: example2Content,
      [example3Path]: example3Content,
      [example4Path]: example4Content,
      [example5Path]: example5Content,
    });

    deepEqual(externalFileCommands.length, 5);

    ok(
      externalFileCommands.filter(
        (command) =>
          (command.kind === "upsertFile" && command.path === example1Path) ||
          (command.kind === "upsertFile" && command.path === example2Path) ||
          (command.kind === "upsertFile" && command.path === example3Path) ||
          (command.kind === "upsertFile" && command.path === example4Path) ||
          (command.kind === "upsertFile" && command.path === example5Path),
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
    deepEqual(example1Command.newData, example1Fixture);
  });

  it("should correctly modify example in fixture #2", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example2Path]: example2Content,
    });

    const example2Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example2Path,
    );

    ok(example2Command);
    ok(example2Command.kind === "upsertFile");
    const example2Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture2.output.ts"),
      "utf-8",
    );
    deepEqual(example2Command.newData, example2Fixture);
  });

  it("should correctly modify example in fixture #3", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example3Path]: example3Content,
    });

    const example3Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example3Path,
    );

    ok(example3Command);
    ok(example3Command.kind === "upsertFile");
    const example3Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture3.output.ts"),
      "utf-8",
    );
    deepEqual(example3Command.newData, example3Fixture);
  });

  it("should correctly modify example in fixture #4", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example4Path]: example4Content,
    });

    const example4Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example4Path,
    );

    ok(example4Command);
    ok(example4Command.kind === "upsertFile");
    const example4Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture4.output.ts"),
      "utf-8",
    );
    deepEqual(example4Command.newData, example4Fixture);
  });

  it("should correctly modify example in fixture #5", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example5Path]: example5Content,
    });

    const example5Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example5Path,
    );

    ok(example5Command);
    ok(example5Command.kind === "upsertFile");
    const example5Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture5.output.ts"),
      "utf-8",
    );
    deepEqual(example5Command.newData, example5Fixture);
  });

  it("should correctly modify example in fixture #6", async () => {
    const externalFileCommands = await transform({
      [schemaPath]: schemaContent,
      [example6Path]: example6Content,
    });

    const example6Command = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === example6Path,
    );

    ok(example6Command);
    ok(example6Command.kind === "upsertFile");
    const example6Fixture = await readFile(
      join(__dirname, "..", "__testfixtures__", "fixture6.output.ts"),
      "utf-8",
    );
    deepEqual(example6Command.newData, example6Fixture);
  });
});
