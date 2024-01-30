import { sep } from 'path';
import { Uri } from 'vscode';
import type { Configuration } from '../configuration';
import { buildCrossplatformArg } from '../utilities';
import type { Message, MessageKind } from './messageBus';

const buildGlobPattern = (targetUri: Uri, pattern?: string) => {
	const { fsPath: targetUriFsPath } = targetUri;

	// Glob patterns should always use / as a path separator, even on Windows systems, as \ is used to escape glob characters.
	const pathParts = targetUriFsPath.split(sep);

	pathParts.push(pattern ?? '');

	return pathParts.join('/');
};

export const buildArguments = (
	configuration: Configuration,
	message: Omit<
		Message & { kind: MessageKind.executeCodemodSet },
		'storageUri'
	>,
	storageUri: Uri,
) => {
	const { command } = message;
	const args: string[] = [];

	const codemodArguments =
		command.kind !== 'executeLocalCodemod'
			? (command.arguments ?? []).flatMap(({ name, value }) => [
					`--arg:${name}`,
					String(value),
			  ])
			: [];

	if (command.kind === 'executePiranhaRule') {
		args.push('-i', buildCrossplatformArg(message.targetUri.fsPath));
		args.push('-c', buildCrossplatformArg(command.configurationUri.fsPath));
		args.push('-o', buildCrossplatformArg(storageUri.fsPath));
		args.push('-l', command.language);
		args.push(...codemodArguments);
		return args;
	}

	if (command.kind === 'executeCodemod') {
		args.push(buildCrossplatformArg(command.name));
	} else {
		args.push(
			'--sourcePath',
			buildCrossplatformArg(command.codemodUri.fsPath),
		);
		args.push('--codemodEngine', 'jscodeshift');
	}

	args.push('--targetPath', buildCrossplatformArg(message.targetUri.fsPath));

	if (message.targetUriIsDirectory) {
		configuration.includePatterns.forEach((includePattern) => {
			args.push(
				'--include',
				buildCrossplatformArg(
					buildGlobPattern(message.targetUri, includePattern),
				),
			);
		});

		configuration.excludePatterns.forEach((excludePattern) => {
			args.push(
				'--exclude',
				buildCrossplatformArg(
					buildGlobPattern(message.targetUri, excludePattern),
				),
			);
		});
	} else {
		args.push(
			'--include',
			buildCrossplatformArg(buildGlobPattern(message.targetUri)),
		);
	}

	args.push('--threadCount', String(configuration.workerThreadCount));
	args.push('--fileLimit', String(configuration.fileLimit));

	if (configuration.formatWithPrettier) {
		args.push('--usePrettier');
	}

	args.push('--useJson');
	args.push('--useCache');

	args.push('--dryRun');
	args.push(
		'--outputDirectoryPath',
		buildCrossplatformArg(storageUri.fsPath),
	);
	args.push(...codemodArguments);
	return args;
};
