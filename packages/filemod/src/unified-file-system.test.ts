import { deepStrictEqual } from "node:assert";
import { createHash } from "node:crypto";
import type * as INodeFs from "node:fs";
import { join } from "node:path";
import { glob } from "glob";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import type {
  GlobArguments,
  PathHashDigest,
  UnifiedEntry,
} from "./unified-file-system.js";
import { UnifiedFileSystem } from "./unified-file-system.js";

const buildHashDigest = (data: string) =>
  createHash("ripemd160").update(data).digest("base64url");

const buildUnifiedFileSystem = (volume: ReturnType<typeof Volume.fromJSON>) => {
  const ifs = createFsFromVolume(volume);

  const getUnifiedEntry = async (path: string): Promise<UnifiedEntry> => {
    const stat = await ifs.promises.stat(path);

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

  const buildPathHashDigest = (path: string) =>
    buildHashDigest(path) as PathHashDigest;

  const globWrapper = (globArguments: GlobArguments) => {
    return glob(globArguments.includePatterns.slice(), {
      absolute: true,
      cwd: globArguments.currentWorkingDirectory,
      ignore: globArguments.excludePatterns.slice(),
      fs: ifs as unknown as typeof INodeFs,
    });
  };

  const readDirectory = async (
    path: string,
  ): Promise<ReadonlyArray<UnifiedEntry>> => {
    const entries = await ifs.promises.readdir(path, {
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
    const data = await ifs.promises.readFile(path, {
      encoding: "utf8",
    });

    return data.toString();
  };

  return new UnifiedFileSystem(
    buildPathHashDigest,
    getUnifiedEntry,
    globWrapper,
    readDirectory,
    readFile,
  );
};
describe("unifiedFileSystem", () => {
  it("should get proper file paths", async () => {
    const volume = Volume.fromJSON({
      "/opt/project/a.json": "",
      "/opt/project/package.json": "",
      "/opt/project/script_a.sh": "",
      "/opt/project/README.md": "",
      "/opt/project/README.notmd": "",
    });

    const unifiedFileSystem = buildUnifiedFileSystem(volume);

    const filePaths = await unifiedFileSystem.getFilePaths(
      "/",
      ["**/package.json", "**/*.{md,sh}"],
      [],
    );

    deepStrictEqual(filePaths, [
      "/opt/project/script_a.sh",
      "/opt/project/package.json",
      "/opt/project/README.md",
    ]);
  });

  it("should move files", async () => {
    const volume = Volume.fromJSON({
      "/opt/a/a.json": "",
    });

    const unifiedFileSystem = buildUnifiedFileSystem(volume);

    deepStrictEqual(await unifiedFileSystem.readDirectory("/opt/a"), [
      "/opt/a/a.json",
    ]);

    await unifiedFileSystem.moveFile("/opt/a/a.json", "/opt/b/a.json");

    deepStrictEqual(await unifiedFileSystem.readDirectory("/opt/a/"), []);
    deepStrictEqual(unifiedFileSystem.buildExternalFileCommands(), [
      { kind: "deleteFile", path: "/opt/a/a.json" },
      { kind: "upsertFile", path: "/opt/b/a.json", oldData: "", newData: "" },
    ]);
  });
});
