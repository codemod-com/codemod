import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { basename, dirname, join } from "node:path";
import hastToBabelAst from "@svgr/hast-util-to-babel-ast";
import jscodeshift from "jscodeshift";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { mdxjs } from "micromark-extension-mdxjs";
import tsmorph from "ts-morph";
import { unified } from "unified";
import { filter } from "unist-util-filter";
import { visit } from "unist-util-visit";

import {
  type CallbackService,
  type Filemod,
  type PathAPI,
  type PathHashDigest,
  type UnifiedEntry,
  UnifiedFileSystem,
  buildApi,
  executeFilemod,
} from "@codemod-com/filemod";
import type { Printer } from "@codemod-com/printer";
import type { Codemod, FileCommand } from "@codemod-com/utilities";
import { defaultJSCodeshiftParser } from "@codemod.com/codemod-utils";
import { isTheSameData } from "#utils.js";
import type { CodemodExecutionErrorCallback } from "../schemata/callbacks.js";

const parseMdx = (data: string) =>
  fromMarkdown(data, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });

const stringifyMdx = (tree: Root) =>
  toMarkdown(tree, { extensions: [mdxToMarkdown()] });

type Root = ReturnType<typeof fromMarkdown>;

export type Dependencies = Readonly<{
  jscodeshift: typeof jscodeshift;
  unified: typeof unified;
  hastToBabelAst: typeof hastToBabelAst;
  tsmorph: typeof tsmorph;
  parseMdx: typeof parseMdx;
  stringifyMdx: typeof stringifyMdx;
  filterMdxAst: typeof filter;
  visitMdxAst: typeof visit;
  unifiedFileSystem: UnifiedFileSystem;
  fetch: typeof fetch;
}>;

export const runFilemod = async (options: {
  filemod: Filemod<Record<string, unknown>, Record<string, unknown>> & {
    name?: string;
  };
  target: string;
  codemod: Codemod;
  printer: Printer;
  onError?: CodemodExecutionErrorCallback;
}): Promise<readonly FileCommand[]> => {
  const {
    filemod,
    target,
    codemod: { safeArgumentRecord, engineOptions },
    printer,
    onError,
  } = options;

  const buildPathHashDigest = (path: string) =>
    createHash("ripemd160").update(path).digest("base64url") as PathHashDigest;

  const getUnifiedEntry = async (path: string): Promise<UnifiedEntry> => {
    const stat = await fs.promises.stat(path);

    if (stat.isDirectory()) {
      return {
        kind: "directory",
        path,
      };
    }

    if (stat.isFile()) {
      return {
        kind: "file",
        path,
      };
    }

    throw new Error(`The entry ${path} is neither a directory nor a file`);
  };

  const readDirectory = async (
    path: string,
  ): Promise<ReadonlyArray<UnifiedEntry>> => {
    const entries = await fs.promises.readdir(path, {
      // @ts-ignore
      withFileTypes: true,
    });

    return entries.map((entry) => {
      if (typeof entry === "string" || !("isDirectory" in entry)) {
        throw new Error("Entry can neither be a string or a Buffer");
      }

      if (entry.isDirectory()) {
        return {
          kind: "directory" as const,
          path: join(path, entry.name.toString()),
        };
      }

      if (entry.isFile()) {
        return {
          kind: "file" as const,
          path: join(path, entry.name.toString()),
        };
      }

      throw new Error("The entry is neither directory not file");
    });
  };

  const readFile = async (path: string): Promise<string> => {
    const data = await fs.promises.readFile(path, {
      encoding: "utf8",
    });

    return data.toString();
  };

  const unifiedFileSystem = new UnifiedFileSystem(
    buildPathHashDigest,
    getUnifiedEntry,
    async () => filemod.includePatterns as string[],
    readDirectory,
    readFile,
  );

  const pathAPI: PathAPI = {
    getDirname: (path) => dirname(path),
    getBasename: (path) => basename(path),
    joinPaths: (...paths) => join(...paths),
    currentWorkingDirectory: target,
  };

  const api = buildApi<Dependencies>(
    unifiedFileSystem,
    () => ({
      jscodeshift: jscodeshift.withParser(
        engineOptions?.parser ?? defaultJSCodeshiftParser,
      ),
      j: jscodeshift.withParser(
        engineOptions?.parser ?? defaultJSCodeshiftParser,
      ),
      unified,
      hastToBabelAst,
      tsmorph,
      parseMdx,
      stringifyMdx,
      fetch,
      visitMdxAst: visit,
      filterMdxAst: filter,
      unifiedFileSystem,
    }),
    pathAPI,
  );

  const processedPathHashDigests = new Set<string>();

  const totalPathHashDigests = new Set<string>();

  for (const path of filemod.includePatterns ?? []) {
    totalPathHashDigests.add(
      createHash("ripemd160").update(path).digest("base64url"),
    );
  }

  const callbackService: CallbackService = {
    onCommandExecuted: (command) => {
      if (command.kind !== "handleFile") {
        return;
      }

      const hashDigest = createHash("ripemd160")
        .update(command.path)
        .digest("base64url");

      processedPathHashDigests.add(hashDigest);
      totalPathHashDigests.add(hashDigest);

      printer.printMessage({
        kind: "progress",
        processedFileNumber: processedPathHashDigests.size,
        totalFileNumber: totalPathHashDigests.size,
        processedFileName: command.path,
      });
    },
    onError: (path, message) => {
      onError?.({ codemodName: filemod.name, filePath: path, message });
    },
  };

  const externalFileCommands = await executeFilemod(
    api,
    filemod,
    target,
    safeArgumentRecord,
    callbackService,
  );

  const commands: (FileCommand | null)[] = await Promise.all(
    externalFileCommands.map(async (externalFileCommand) => {
      if (externalFileCommand.kind === "upsertFile") {
        try {
          await fs.promises.stat(externalFileCommand.path);

          if (
            isTheSameData(
              externalFileCommand.oldData,
              externalFileCommand.newData,
            )
          ) {
            return null;
          }

          return {
            kind: "updateFile",
            oldPath: externalFileCommand.path,
            oldData: externalFileCommand.oldData,
            newData: externalFileCommand.newData,
          };
        } catch (error) {
          return {
            kind: "createFile",
            newPath: externalFileCommand.path,
            newData: externalFileCommand.newData,
          };
        }
      }

      return {
        kind: "deleteFile",
        oldPath: externalFileCommand.path,
      };
    }),
  );

  return commands.filter(Boolean);
};
