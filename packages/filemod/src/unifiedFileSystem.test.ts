import { createHash } from "crypto";
import { deepStrictEqual } from "node:assert";
import { join } from "node:path";
import { FileSystemAdapter, glob } from "fast-glob";
import { createFsFromVolume, Volume } from "memfs";
import { describe, it } from "vitest";
import type {
	GlobArguments,
	PathHashDigest,
	UnifiedEntry,
} from "./unifiedFileSystem.js";
import { UnifiedFileSystem } from "./unifiedFileSystem.js";

export const buildHashDigest = (data: string) =>
	createHash("ripemd160").update(data).digest("base64url");

describe("unifiedFileSystem", function () {
	it("should get proper file paths", async function () {
		const volume = Volume.fromJSON({
			"/opt/project/a.json": "",
			"/opt/project/package.json": "",
			"/opt/project/script_a.sh": "",
			"/opt/project/README.md": "",
			"/opt/project/README.notmd": "",
		});

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

		const fileSystemAdapter = ifs as Partial<FileSystemAdapter>;

		const globWrapper = (globArguments: GlobArguments) => {
			return glob(globArguments.includePatterns.slice(), {
				absolute: true,
				cwd: globArguments.currentWorkingDirectory,
				ignore: globArguments.excludePatterns.slice(),
				fs: fileSystemAdapter,
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

		const unifiedFileSystem = new UnifiedFileSystem(
			buildPathHashDigest,
			getUnifiedEntry,
			globWrapper,
			readDirectory,
			readFile,
		);

		const filePaths = await unifiedFileSystem.getFilePaths(
			"/",
			["**/package.json", "**/*.{md,sh}"],
			[],
		);

		deepStrictEqual(filePaths, [
			"/opt/project/README.md",
			"/opt/project/package.json",
			"/opt/project/script_a.sh",
		]);
	});
});
