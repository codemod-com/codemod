import type { API, DataAPI, DirectoryAPI, FileAPI } from './api.js';
import type { ExternalFileCommand } from './externalFileCommands.js';
import type {
	Command,
	DataCommand,
	DirectoryCommand,
	FileCommand,
	FinishCommand,
} from './internalCommands.js';
import type { Options, RSU, State } from './options.js';

type DistributedOmit<T, K> =
	T extends NonNullable<unknown> ? Pick<T, Exclude<keyof T, K>> : never;

export type CallbackService = Readonly<{
	onCommandExecuted?: (
		command: DistributedOmit<Command, 'data' | 'options'>,
	) => void;
	onError?: (path: string, message: string) => void;
}>;

export type HandleDirectory<D extends RSU, S extends State> = (
	api: DirectoryAPI<D>,
	path: string,
	options: Options,
	state: S | null,
) => Promise<readonly DirectoryCommand[]>;

export type HandleFile<D extends RSU, S> = (
	api: FileAPI<D>,
	path: string,
	options: Options,
	state: S | null,
) => Promise<readonly FileCommand[]>;

export type HandleData<D extends RSU, S extends State> = (
	api: DataAPI<D>,
	path: string,
	data: string,
	options: Options,
	state: S | null,
) => Promise<DataCommand>;

export type InitializeState<S extends State> = (
	options: Options,
	previousState: S | null,
) => Promise<S>;

export type HandleFinish<S extends State> = (
	options: Options,
	state: S | null,
) => Promise<FinishCommand>;

export interface Filemod<D extends RSU, S extends State> {
	readonly includePatterns?: readonly string[];
	readonly excludePatterns?: readonly string[];
	readonly handleDirectory?: HandleDirectory<D, S>;
	readonly handleFile?: HandleFile<D, S>;
	readonly handleData?: HandleData<D, S>;
	readonly initializeState?: InitializeState<S>;
	readonly handleFinish?: HandleFinish<S>;
}

let defaultHandleDirectory: HandleDirectory<RSU, State> = async (
	api,
	directoryPath,
	options,
) => {
	let commands: DirectoryCommand[] = [];

	let paths = await api.readDirectory(directoryPath);

	for (let path of paths) {
		let directory = api.isDirectory(path);

		if (directory) {
			commands.push({
				kind: 'handleDirectory',
				path,
				options,
			});
		} else {
			commands.push({
				kind: 'handleFile',
				path,
				options,
			});
		}
	}

	return commands;
};

let defaultHandleFile: Filemod<RSU, State>['handleFile'] = async (
	_,
	path,
	options,
) =>
	Promise.resolve([
		{
			kind: 'upsertFile',
			path,
			options,
		},
	]);

let defaultHandleData: Filemod<RSU, State>['handleData'] = async () =>
	Promise.resolve({
		kind: 'noop',
	});

let handleCommand = async <D extends RSU, S extends State>(
	api: API<D>,
	filemod: Filemod<D, S>,
	command: Command,
	callbackService: CallbackService,
	state: S | null,
): Promise<void> => {
	if (command.kind === 'handleDirectory') {
		if (filemod.includePatterns && filemod.includePatterns.length > 0) {
			let paths = await api.unifiedFileSystem.getFilePaths(
				command.path,
				filemod.includePatterns,
				filemod.excludePatterns ?? [],
			);

			for (let path of paths) {
				await handleCommand(
					api,
					filemod,
					{
						kind: 'handleFile',
						path,
						options: command.options,
					},
					callbackService,
					state,
				);
			}

			callbackService.onCommandExecuted?.({
				kind: command.kind,
				path: command.path,
			});
		}

		let unifiedEntry = await api.unifiedFileSystem.upsertUnifiedDirectory(
			command.path,
		);

		if (unifiedEntry === null) {
			return;
		}

		let defaultDirectoryHandler = !filemod.includePatterns
			? defaultHandleDirectory
			: null;

		let handleDirectory =
			filemod.handleDirectory ?? defaultDirectoryHandler;

		if (handleDirectory === null) {
			return;
		}

		let commands = await handleDirectory(
			api.directoryAPI,
			command.path,
			command.options,
			state,
		);

		for (let command of commands) {
			await handleCommand(api, filemod, command, callbackService, state);
		}

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			path: command.path,
		});
	}

	if (command.kind === 'handleFile') {
		let unifiedEntry = await api.unifiedFileSystem.upsertUnifiedFile(
			command.path,
		);

		if (unifiedEntry === null) {
			return;
		}

		let handleFile = filemod.handleFile ?? defaultHandleFile;

		try {
			let commands = await handleFile(
				api.fileAPI,
				command.path,
				command.options,
				state,
			);

			for (let command of commands) {
				await handleCommand(
					api,
					filemod,
					command,
					callbackService,
					state,
				);
			}
		} catch (error) {
			callbackService.onError?.(
				command.path,
				error instanceof Error ? error.message : String(error),
			);
		}

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			path: command.path,
		});
	}

	if (command.kind === 'upsertFile') {
		let data = await api.unifiedFileSystem.readFile(command.path);

		let handleData = filemod.handleData ?? defaultHandleData;

		try {
			let dataCommand = await handleData(
				api.dataAPI,
				command.path,
				data,
				command.options,
				state,
			);

			await handleCommand(
				api,
				filemod,
				dataCommand,
				callbackService,
				state,
			);
		} catch (error) {
			callbackService.onError?.(
				command.path,
				error instanceof Error ? error.message : String(error),
			);
		}

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			path: command.path,
		});
	}

	if (command.kind === 'deleteFile') {
		api.unifiedFileSystem.deleteFile(command.path);

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			path: command.path,
		});
	}

	if (command.kind === 'upsertData') {
		api.unifiedFileSystem.upsertData(command.path, command.data);

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			path: command.path,
		});
	}

	if (command.kind === 'moveFile') {
		api.unifiedFileSystem.moveFile(command.oldPath, command.newPath);

		callbackService.onCommandExecuted?.({
			kind: command.kind,
			oldPath: command.oldPath,
			newPath: command.newPath,
		});
	}
};

export let executeFilemod = async <D extends RSU, S extends State>(
	api: API<D>,
	filemod: Filemod<D, S>,
	path: string,
	options: Options,
	callbackService: CallbackService,
	state?: S | null,
): Promise<readonly ExternalFileCommand[]> => {
	let unifiedEntry = await api.unifiedFileSystem.upsertUnifiedEntry(path);

	if (unifiedEntry === null) {
		return [];
	}

	let command: DirectoryCommand = {
		kind:
			unifiedEntry.kind === 'directory'
				? 'handleDirectory'
				: 'handleFile',
		path,
		options,
	};

	let previousState = state ?? null;

	let nextState =
		(await filemod.initializeState?.(options, previousState)) ?? null;

	await handleCommand<D, S>(
		api,
		filemod,
		command,
		callbackService,
		nextState,
	);

	let finishCommand = (await filemod.handleFinish?.(options, nextState)) ?? {
		kind: 'noop',
	};

	if (finishCommand.kind === 'noop') {
		return api.unifiedFileSystem.buildExternalFileCommands();
	}

	return executeFilemod<D, S>(
		api,
		filemod,
		path,
		options,
		callbackService,
		nextState,
	);
};
