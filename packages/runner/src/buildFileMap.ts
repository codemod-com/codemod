import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import type { FileSystem } from '@codemod-com/utilities';

export let buildFileMap = async (
	sourceFileSystem: FileSystem,
	targetFileSystem: FileSystem,
	paths: string[],
): Promise<Map<string, string>> => {
	let fileMap = new Map<string, string>();

	for (let path of paths) {
		let data = await sourceFileSystem.promises.readFile(path, {
			encoding: 'utf8',
		});

		await targetFileSystem.promises.mkdir(dirname(path), {
			recursive: true,
		});
		await targetFileSystem.promises.writeFile(path, data);

		let dataHashDigest = createHash('ripemd160')
			.update(data)
			.digest('base64url');

		fileMap.set(path, dataHashDigest);
	}

	return fileMap;
};
