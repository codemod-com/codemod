import { createHash } from 'node:crypto';
import { join, extname, dirname } from 'node:path';
import { Options } from 'prettier';
import { IFs } from 'memfs';
import { filterNeitherNullNorUndefined } from './filterNeitherNullNorUndefined.js';
import { OperationMessage } from './messages.js';
import { RunSettings } from './schemata/runArgvSettingsSchema.js';

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

export const DEFAULT_PRETTIER_OPTIONS: Options = {
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	trailingComma: 'all',
	bracketSpacing: true,
	arrowParens: 'always',
	endOfLine: 'lf',
	parser: 'typescript',
};

export const getConfig = async (path: string): Promise<Options> => {
	const { resolveConfig } = await import('prettier');

	const config = await resolveConfig(path, {
		editorconfig: false,
	});

	if (config === null || Object.keys(config).length === 0) {
		throw new Error('Unable to resolve config');
	}

	const parser = path.endsWith('.css')
		? 'css'
		: config.parser ?? DEFAULT_PRETTIER_OPTIONS.parser;

	return {
		...config,
		parser,
	};
};

export const formatText = async (
	path: string,
	oldData: string,
	formatWithPrettier: boolean,
): Promise<string> => {
	const newData = oldData.replace(/\/\*\* \*\*\//gm, '');

	if (!formatWithPrettier) {
		return newData;
	}

	try {
		const { format } = await import('prettier');
		const options = await getConfig(path);
		return format(newData, options);
	} catch (err) {
		return newData;
	}
};

export const buildFormattedFileCommand = async (
	command: FileCommand,
): Promise<FormattedFileCommand | null> => {
	if (command.kind === 'createFile') {
		const newData = await formatText(
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
		const newData = await formatText(
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

export const buildFormattedFileCommands = async (
	commands: readonly FileCommand[],
): Promise<readonly FormattedFileCommand[]> => {
	const formattedFileCommands = await Promise.all(
		commands.map((command) => buildFormattedFileCommand(command)),
	);

	return formattedFileCommands.filter(filterNeitherNullNorUndefined);
};

export const modifyFileSystemUponWetRunCommand = async (
	fileSystem: IFs,
	command: FormattedFileCommand,
): Promise<void> => {
	if (command.kind === 'createFile') {
		const directoryPath = dirname(command.newPath);

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
		const directoryPath = dirname(command.newPath);

		await fileSystem.promises.mkdir(directoryPath, { recursive: true });

		return fileSystem.promises.copyFile(command.oldPath, command.newPath);
	}
};

export const buildNewDataPathForCreateFileCommand = (
	outputDirectoryPath: string,
	command: FormattedFileCommand & { kind: 'createFile' },
): string => {
	const hashDigest = createHash('md5')
		.update(command.kind)
		.update(command.newPath)
		.update(command.newData)
		.digest('base64url');

	const extName = extname(command.newPath);

	return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export const buildNewDataPathForUpdateFileCommand = (
	outputDirectoryPath: string,
	command: FormattedFileCommand & { kind: 'updateFile' },
): string => {
	const hashDigest = createHash('md5')
		.update(command.kind)
		.update(command.oldPath)
		.update(command.newData)
		.digest('base64url');

	const extName = extname(command.oldPath);

	return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export const modifyFileSystemUponDryRunCommand = async (
	fileSystem: IFs,
	outputDirectoryPath: string,
	command: FormattedFileCommand,
): Promise<void> => {
	if (command.kind === 'createFile') {
		const newDataPath = buildNewDataPathForCreateFileCommand(
			outputDirectoryPath,
			command,
		);

		await fileSystem.promises.writeFile(newDataPath, command.newData);
	}

	if (command.kind === 'updateFile') {
		const newDataPath = buildNewDataPathForUpdateFileCommand(
			outputDirectoryPath,
			command,
		);

		await fileSystem.promises.writeFile(newDataPath, command.newData);
	}
};

export const modifyFileSystemUponCommand = (
	fileSystem: IFs,
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

export const buildPrinterMessageUponCommand = (
	runSettings: RunSettings,
	command: FormattedFileCommand,
): OperationMessage | null => {
	if (!runSettings.dryRun) {
		return null;
	}

	if (command.kind === 'createFile') {
		const newDataPath = buildNewDataPathForCreateFileCommand(
			runSettings.outputDirectoryPath,
			command,
		);

		return {
			kind: 'create',
			newFilePath: command.newPath,
			newContentPath: newDataPath,
		};
	}

	if (command.kind === 'deleteFile') {
		return {
			kind: 'delete',
			oldFilePath: command.oldPath,
		};
	}

	if (command.kind === 'moveFile') {
		return {
			kind: 'move',
			oldFilePath: command.oldPath,
			newFilePath: command.newPath,
		};
	}

	if (command.kind === 'updateFile') {
		const newDataPath = buildNewDataPathForUpdateFileCommand(
			runSettings.outputDirectoryPath,
			command,
		);

		return {
			kind: 'rewrite',
			oldPath: command.oldPath,
			newDataPath,
		};
	}

	if (command.kind === 'copyFile') {
		return {
			kind: 'copy',
			oldFilePath: command.oldPath,
			newFilePath: command.newPath,
		};
	}

	throw new Error('Not supported command');
};
