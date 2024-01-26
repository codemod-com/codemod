import type { Options } from './options.js';

export interface UpsertFileCommand {
	readonly kind: 'upsertFile';
	readonly path: string;
	readonly options: Options;
}

export interface DeleteFileCommand {
	readonly kind: 'deleteFile';
	readonly path: string;
}

export interface MoveFileCommand {
	readonly kind: 'moveFile';
	readonly oldPath: string;
	readonly newPath: string;
	readonly options: Options;
}

export interface CopyFileCommand {
	readonly kind: 'copyFile';
	readonly oldPath: string;
	readonly newPath: string;
	readonly options: Options;
}

export type FileCommand =
	| UpsertFileCommand
	| DeleteFileCommand
	| MoveFileCommand
	| CopyFileCommand;

export interface HandleDirectoryCommand {
	readonly kind: 'handleDirectory';
	readonly path: string;
	readonly options: Options;
}

export interface HandleFileCommand {
	readonly kind: 'handleFile';
	readonly path: string;
	readonly options: Options;
}

export type DirectoryCommand = HandleDirectoryCommand | HandleFileCommand;

export interface UpsertDataCommand {
	readonly kind: 'upsertData';
	readonly data: string;
	readonly path: string; // TODO we can remove it and add from context at a later stage
}

export interface NoopCommand {
	readonly kind: 'noop';
}

export type DataCommand = UpsertDataCommand | NoopCommand;

export interface RestartCommand {
	readonly kind: 'restart';
}

export type FinishCommand = RestartCommand | NoopCommand;

export type Command =
	| DirectoryCommand
	| FileCommand
	| DataCommand
	| FinishCommand;
