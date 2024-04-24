import { randomBytes } from "node:crypto";
import type { PathLike } from "node:fs";
import { open, rm, writeFile } from "node:fs/promises";
import { afterAll, describe, it } from "vitest";
import { FileWatcher } from "./fileWatcher.js";

const withFile = async <T>(
	pathLike: string,
	callback: (pathLike: PathLike) => Promise<T>,
) => {
	try {
		await writeFile(pathLike, Buffer.from([]));

		await callback(pathLike);
	} finally {
		await rm(pathLike);
	}
};

describe("fileWatcher", () => {
	const fileName = `./${randomBytes(20).toString("base64url")}.data`;

	afterAll(() => rm(fileName, { force: true }));

	it("should report the correct number of changes", async () => {
		await withFile(fileName, async (pathLike) => {
			let callback: (() => void) | null = null;

			const watcher = new FileWatcher(pathLike, () => {
				callback?.();
			});

			watcher.watch();

			const fileHandle = await open(pathLike, "w");

			const write = async () => {
				for (let i = 0; i < 3; ++i) {
					await fileHandle.write(Buffer.from([1]));
				}
			};

			const callbackPromise = new Promise<void>((resolve) => {
				callback = () => {
					watcher.close();

					resolve();
				};
			});

			return Promise.all([write(), callbackPromise]);
		});
	});
});
