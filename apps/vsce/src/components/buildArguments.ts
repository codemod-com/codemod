import type { Uri } from 'vscode';
import type { Configuration } from '../configuration';
import {
	buildCrossplatformArg,
	buildGlobPattern,
	singleQuotify,
} from '../utilities';
import type { Message, MessageKind } from './messageBus';

export let buildArguments = (
	configuration: Configuration,
	message: Omit<
		Message & { kind: MessageKind.executeCodemodSet },
		'storageUri'
	>,
	storageUri: Uri,
) => {
	let { command } = message;
	let args: string[] = [];

	let codemodArguments =
		command.kind !== 'executeLocalCodemod'
			? (command.arguments ?? []).flatMap(({ name, value }) => [
					`--${name}`,
					singleQuotify(String(value)),
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
			args.push('--include', buildCrossplatformArg(includePattern));
		});

		configuration.excludePatterns.forEach((excludePattern) => {
			args.push('--exclude', buildCrossplatformArg(excludePattern));
		});
	} else {
		args.push(
			'--include',
			buildCrossplatformArg(buildGlobPattern(message.targetUri)),
		);
	}

	args.push('--threads', String(configuration.workerThreadCount));

	if (!configuration.formatWithPrettier) {
		args.push('--raw');
	}

	args.push('--json');

	args.push('--output', buildCrossplatformArg(storageUri.fsPath));
	args.push('--disable-tree-version-check');

	args.push(...codemodArguments);
	args.push('--clientIdentifier', buildCrossplatformArg('VSCE'));
	return args;
};
