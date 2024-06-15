import { createHash } from 'node:crypto';
import { dirname, extname, join } from 'node:path';
import {
	type FileSystem,
	formatText,
	isNeitherNullNorUndefined,
} from '@codemod-com/utilities';
import type { RunSettings } from './schemata/runArgvSettingsSchema.js';

export type CreateFileCommand = Readonly<{
	kind: 'createFile';
	newPath: string;
	newData: string;
	formatWithPrettier: boolean;
}>;

export type UpdateFileCommand = Readonly<{
	kind: 'updateFile';
	oldPath: string;
	oldData: string;
	newData: string;
	formatWithPrettier: boolean;
}>;

export type DeleteFileCommand = Readonly<{
	kind: 'deleteFile';
	oldPath: string;
}>;

export type MoveFileCommand = Readonly<{
	kind: 'moveFile';
	oldPath: string;
	newPath: string;
}>;

export type CopyFileCommand = Readonly<{
	kind: 'copyFile';
	oldPath: string;
	newPath: string;
}>;

export type FileCommand =
	| CreateFileCommand
	| UpdateFileCommand
	| DeleteFileCommand
	| MoveFileCommand
	| CopyFileCommand;

export type FormattedFileCommand = FileCommand & { formatted: true };

export let buildFormattedFileCommand = async (
	command: FileCommand,
): Promise<FormattedFileCommand | null> => {
	if (command.kind === 'createFile') {
		let newData = await formatText(
			command.newPath,
			command.newData,
			command.formatWithPrettier,
		);

		return {
			...command,
			newData,
			formatted: true,
		};
	}

	if (command.kind === 'updateFile') {
		let newData = await formatText(
			command.oldPath,
			command.newData,
			command.formatWithPrettier,
		);

		if (command.oldData === newData) {
			return null;
		}

		return {
			...command,
			newData,
			formatted: true,
		};
	}

	return {
		...command,
		formatted: true,
	};
};

export let buildFormattedFileCommands = async (
	commands: readonly FileCommand[],
): Promise<readonly FormattedFileCommand[]> => {
	let formattedFileCommands = await Promise.all(
		commands.map((command) => buildFormattedFileCommand(command)),
	);

	return formattedFileCommands.filter(isNeitherNullNorUndefined);
};

export let modifyFileSystemUponWetRunCommand = async (
	fileSystem: FileSystem,
	command: FormattedFileCommand,
): Promise<void> => {
	if (command.kind === 'createFile') {
		let directoryPath = dirname(command.newPath);

		await fileSystem.promises.mkdir(directoryPath, { recursive: true });

		return fileSystem.promises.writeFile(command.newPath, command.newData);
	}

	if (command.kind === 'deleteFile') {
		return fileSystem.promises.unlink(command.oldPath);
	}

	if (command.kind === 'moveFile') {
		await fileSystem.promises.copyFile(command.oldPath, command.newPath);

		return fileSystem.promises.unlink(command.oldPath);
	}

	if (command.kind === 'updateFile') {
		return fileSystem.promises.writeFile(command.oldPath, command.newData);
	}

	if (command.kind === 'copyFile') {
		let directoryPath = dirname(command.newPath);

		await fileSystem.promises.mkdir(directoryPath, { recursive: true });

		return fileSystem.promises.copyFile(command.oldPath, command.newPath);
	}
};

export let buildNewDataPathForCreateFileCommand = (
	outputDirectoryPath: string,
	command: FormattedFileCommand & { kind: 'createFile' },
): string => {
	let hashDigest = createHash('md5')
		.update(command.kind)
		.update(command.newPath)
		.update(command.newData)
		.digest('base64url');

	let extName = extname(command.newPath);

	return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export let buildNewDataPathForUpdateFileCommand = (
	outputDirectoryPath: string,
	command: FormattedFileCommand & { kind: 'updateFile' },
): string => {
	let hashDigest = createHash('md5')
		.update(command.kind)
		.update(command.oldPath)
		.update(command.newData)
		.digest('base64url');

	let extName = extname(command.oldPath);

	return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export let modifyFileSystemUponDryRunCommand = async (
	fileSystem: FileSystem,
	outputDirectoryPath: string,
	command: FormattedFileCommand,
): Promise<void> => {
	if (command.kind === 'createFile') {
		let newDataPath = buildNewDataPathForCreateFileCommand(
			outputDirectoryPath,
			command,
		);

		await fileSystem.promises.writeFile(newDataPath, command.newData);
	}

	if (command.kind === 'updateFile') {
		let newDataPath = buildNewDataPathForUpdateFileCommand(
			outputDirectoryPath,
			command,
		);

		await fileSystem.promises.writeFile(newDataPath, command.newData);
	}
};

export let modifyFileSystemUponCommand = (
	fileSystem: FileSystem,
	runSettings: RunSettings,
	command: FormattedFileCommand,
) => {
	return runSettings.dryRun === true
		? modifyFileSystemUponDryRunCommand(
				fileSystem,
				runSettings.outputDirectoryPath,
				command,
			)
		: modifyFileSystemUponWetRunCommand(fileSystem, command);
};
