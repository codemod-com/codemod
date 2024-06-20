import { createHash } from 'node:crypto';
import type { IFs } from 'memfs';
import type { FileCommand } from './fileCommands.js';

export let buildFileCommands = async (
	fileMap: ReadonlyMap<string, string>,
	newPaths: ReadonlyArray<string>,
	oldPaths: ReadonlyArray<string>,
	targetFileSystem: IFs,
): Promise<ReadonlyArray<FileCommand>> => {
	let fileCommands: FileCommand[] = [];

	for (let newPath of newPaths) {
		let newDataBuffer = await targetFileSystem.promises.readFile(newPath);
		let newData = newDataBuffer.toString();

		let oldDataFileHash = fileMap.get(newPath) ?? null;

		if (oldDataFileHash === null) {
			// the file has been created
			fileCommands.push({
				kind: 'createFile',
				newPath,
				newData,
				formatWithPrettier: false,
			});
		} else {
			let newDataFileHash = createHash('ripemd160')
				.update(newData)
				.digest('base64url');

			if (newDataFileHash !== oldDataFileHash) {
				fileCommands.push({
					kind: 'updateFile',
					oldPath: newPath,
					newData,
					oldData: '', // TODO no longer necessary
					formatWithPrettier: false,
				});
			}

			// no changes to the file
		}

		// TODO this is no longer necessary
		// fileMap.delete(newPath);
	}

	for (let oldPath of oldPaths) {
		fileCommands.push({
			kind: 'deleteFile',
			oldPath,
		});
	}

	return fileCommands;
};
