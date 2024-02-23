import { createHash } from "node:crypto";
import { dirname } from "node:path";
import type { IFs } from "memfs";

export const buildFileMap = async (
	sourceFileSystem: IFs,
	targetFileSystem: IFs,
	paths: ReadonlyArray<string>,
): Promise<Map<string, string>> => {
	const fileMap = new Map<string, string>();

	for (const path of paths) {
		const data = await sourceFileSystem.promises.readFile(path, {
			encoding: "utf8",
		});

		await targetFileSystem.promises.mkdir(dirname(path), {
			recursive: true,
		});
		await targetFileSystem.promises.writeFile(path, data);

		const dataHashDigest = createHash("ripemd160")
			.update(data)
			.digest("base64url");

		fileMap.set(path, dataHashDigest);
	}

	return fileMap;
};
