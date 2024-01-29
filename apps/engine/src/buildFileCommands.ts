import { IFs } from 'memfs';
import { FileCommand } from './fileCommands.js';
import { createHash } from 'node:crypto';

export const buildFileCommands = async (
	fileMap: ReadonlyMap<string, string>,
	newPaths: ReadonlyArray<string>,
	oldPaths: ReadonlyArray<string>,
	targetFileSystem: IFs,
): Promise<ReadonlyArray<FileCommand>> => {
	const fileCommands: FileCommand[] = [];

	for (const newPath of newPaths) {
		const newDataBuffer = await targetFileSystem.promises.readFile(newPath);
		const newData = newDataBuffer.toString();

		const oldDataFileHash = fileMap.get(newPath) ?? null;

		if (oldDataFileHash === null) {
			// the file has been created
			fileCommands.push({
				kind: 'createFile',
				newPath,
				newData,
				formatWithPrettier: false,
			});
		} else {
			const newDataFileHash = createHash('ripemd160')
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

	for (const oldPath of oldPaths) {
		fileCommands.push({
			kind: 'deleteFile',
			oldPath,
		});
	}

	return fileCommands;
};
