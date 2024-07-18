import { createHash } from "node:crypto";
import type * as INodeFs from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  type GlobArguments,
  type PathAPI,
  type PathHashDigest,
  type UnifiedEntry,
  UnifiedFileSystem,
} from "@codemod-com/filemod";
import { glob } from "glob";
import type { API } from "jscodeshift";
import jscodeshift from "jscodeshift";
import type { IFs } from "memfs";

export const buildApi = (parser: string | undefined): API => ({
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

export const buildPathHashDigest = (path: string) =>
  createHash("ripemd160").update(path).digest("base64url") as PathHashDigest;

export const getUnifiedEntry =
  (fileSystem: IFs) =>
  async (path: string): Promise<UnifiedEntry> => {
    const stat = await fileSystem.promises.stat(path);

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

export const buildGlobWrapper =
  (fileSystem: IFs) => (globArguments: GlobArguments) => {
    return glob(globArguments.includePatterns.slice(), {
      absolute: true,
      cwd: globArguments.currentWorkingDirectory,
      ignore: globArguments.excludePatterns.slice(),
      fs: fileSystem as unknown as typeof INodeFs,
      nodir: true,
    });
  };

export const buildReadDirectory =
  (fileSystem: IFs) =>
  async (path: string): Promise<ReadonlyArray<UnifiedEntry>> => {
    const entries = await fileSystem.promises.readdir(path, {
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

export const buildReadFile =
  (fileSystem: IFs) =>
  async (path: string): Promise<string> => {
    const data = await fileSystem.promises.readFile(path, {
      encoding: "utf8",
    });

    return data.toString();
  };

export const buildUnifiedFileSystem = (fileSystem: IFs) =>
  new UnifiedFileSystem(
    buildPathHashDigest,
    getUnifiedEntry(fileSystem),
    buildGlobWrapper(fileSystem),
    buildReadDirectory(fileSystem),
    buildReadFile(fileSystem),
  );

export const buildPathAPI = (currentWorkingDirectory: string): PathAPI => ({
  getDirname: (path) => dirname(path),
  getBasename: (path) => basename(path),
  joinPaths: (...paths) => join(...paths),
  currentWorkingDirectory,
});

export const trimLicense = (testFixture: string): string => {
  return testFixture.replace(/\/\*[\s\S]*?\*\//gm, "");
};
