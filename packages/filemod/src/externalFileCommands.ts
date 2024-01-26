export interface ExternalUpsertFileCommand {
	kind: 'upsertFile';
	path: string;
	data: string;
}

export interface ExternalDeleteFileCommand {
	kind: 'deleteFile';
	path: string;
}

export type ExternalFileCommand =
	| ExternalUpsertFileCommand
	| ExternalDeleteFileCommand;
