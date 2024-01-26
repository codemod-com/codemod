import { Uri } from 'vscode';
import type { Configuration } from '../configuration';
import { singleQuotify } from '../utilities';
import type { Message, MessageKind } from './messageBus';

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
		args.push('-i', singleQuotify(message.targetUri.fsPath));
		args.push('-c', singleQuotify(command.configurationUri.fsPath));
		args.push('-o', singleQuotify(storageUri.fsPath));
		args.push('-l', command.language);
		args.push(...codemodArguments);
		return args;
	}

	if (command.kind === 'executeCodemod') {
		args.push(singleQuotify(command.name));
	} else {
		args.push('--sourcePath', singleQuotify(command.codemodUri.fsPath));
		args.push('--codemodEngine', 'jscodeshift');
	}

	args.push('--targetPath', singleQuotify(message.targetUri.fsPath));

	if (message.targetUriIsDirectory) {
		configuration.includePatterns.forEach((includePattern) => {
			const { fsPath } = Uri.joinPath(message.targetUri, includePattern);

			args.push('--include', singleQuotify(fsPath));
		});

		configuration.excludePatterns.forEach((excludePattern) => {
			const { fsPath } = Uri.joinPath(message.targetUri, excludePattern);

			args.push('--exclude', singleQuotify(fsPath));
		});
	} else {
		args.push('--include', singleQuotify(message.targetUri.fsPath));
	}

	args.push('--threadCount', String(configuration.workerThreadCount));
	args.push('--fileLimit', String(configuration.fileLimit));

	if (configuration.formatWithPrettier) {
		args.push('--usePrettier');
	}

	args.push('--useJson');
	args.push('--useCache');

	args.push('--dryRun');
	args.push('--outputDirectoryPath', singleQuotify(storageUri.fsPath));
	args.push(...codemodArguments);
	return args;
};
