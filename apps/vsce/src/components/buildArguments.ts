import { Uri } from 'vscode';
import type { Configuration } from '../configuration';
import { buildCrossplatformArg, buildGlobPattern } from '../utilities';
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
		args.push('--source', buildCrossplatformArg(command.codemodUri.fsPath));
		args.push('--engine', 'jscodeshift');
	}

	args.push('--target', buildCrossplatformArg(message.targetUri.fsPath));

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

	args.push('--threads', String(configuration.workerThreadCount));
	args.push('--limit', String(configuration.fileLimit));

	if (configuration.formatWithPrettier) {
		args.push('--prettier');
	}

	args.push('--json');

	args.push('--dry');
	args.push('--output', buildCrossplatformArg(storageUri.fsPath));
	args.push(...codemodArguments);
	return args;
};
