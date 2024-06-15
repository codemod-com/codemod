import type { PiranhaLanguage } from '@codemod-com/utilities';
import { type Disposable, EventEmitter, type Uri } from 'vscode';
import type { Case, CaseHash } from '../cases/types';
import type { ExecutionError } from '../errors/types';
import type { Job, JobHash } from '../jobs/types';
import type { CodemodHash } from '../packageJsonAnalyzer/types';
import type { CodemodArgumentWithValue } from '../selectors/selectCodemodTree';

export enum MessageKind {
	/** cases and jobs */
	upsertCase = 3,
	upsertJobs = 4,

	rejectCase = 5,
	rejectJobs = 6,
	jobsRejected = 7,

	acceptCase = 8,
	acceptJobs = 9,
	jobsAccepted = 10,

	/** bootstrap */
	bootstrapEngine = 13,
	engineBootstrapped = 14,

	/** information message */
	showInformationMessage = 17,

	/** codemod sets */
	executeCodemodSet = 18,
	codemodSetExecuted = 19,

	/** file system operations */
	updateFile = 22,
	deleteFiles = 23,
	moveFile = 24,
	createFile = 25,
	deleteDirectories = 26,

	/**
	 * show progress
	 */
	showProgress = 31,

	focusFile = 37,

	mainWebviewViewVisibilityChange = 38,
	executionQueueChange = 39,

	loadHomeDirectoryData = 40,
	loadHomeDirectoryCase = 41,

	codemodEngineNodeLocated = 42,
}

export type Command =
	| Readonly<{
			kind: 'executeCodemod';
			codemodHash: CodemodHash;
			name: string;
			arguments?: ReadonlyArray<CodemodArgumentWithValue>;
	  }>
	| Readonly<{
			kind: 'executeLocalCodemod';
			codemodUri: Uri;
			codemodHash: CodemodHash | null;
			name: string;
	  }>
	| Readonly<{
			kind: 'executePiranhaRule';
			name: string;
			configurationUri: Uri;
			language: PiranhaLanguage;
			arguments?: ReadonlyArray<CodemodArgumentWithValue>;
	  }>;

export type Message =
	| Readonly<{
			kind: MessageKind.upsertCase;
			kase: Case;
			jobs: ReadonlyArray<Job>;
	  }>
	| Readonly<{
			kind: MessageKind.upsertJobs;
			jobs: ReadonlyArray<Job>;
	  }>
	| Readonly<{
			kind: MessageKind.rejectCase;
			caseHash: CaseHash;
	  }>
	| Readonly<{
			kind: MessageKind.rejectJobs;
			jobHashes: ReadonlySet<JobHash>;
	  }>
	| Readonly<{
			kind: MessageKind.jobsRejected;
			deletedJobs: ReadonlySet<Job>;
	  }>
	| Readonly<{
			kind: MessageKind.acceptCase;
			caseHash: CaseHash;
	  }>
	| Readonly<{
			kind: MessageKind.acceptJobs;
			jobHashes: ReadonlySet<JobHash>;
	  }>
	| Readonly<{
			kind: MessageKind.jobsAccepted;
			deletedJobs: ReadonlySet<Job>;
	  }>
	| Readonly<{
			kind: MessageKind.bootstrapEngine;
	  }>
	| Readonly<{
			kind: MessageKind.engineBootstrapped;
			codemodEngineRustExecutableUri: Uri | null;
	  }>
	| Readonly<{
			kind: MessageKind.executeCodemodSet;
			command: Command;
			happenedAt: string;
			caseHashDigest: CaseHash;
			storageUri: Uri;
			targetUri: Uri;
			targetUriIsDirectory: boolean;
	  }>
	| Readonly<{
			kind: MessageKind.codemodSetExecuted;
			halted: boolean;
			fileCount: number;
			case: Case;
			executionErrors: ReadonlyArray<ExecutionError>;
	  }>
	| Readonly<{
			kind: MessageKind.updateFile;
			uri: Uri;
			contentUri: Uri;
	  }>
	| Readonly<{
			kind: MessageKind.deleteFiles;
			uris: ReadonlyArray<Uri>;
	  }>
	| Readonly<{
			kind: MessageKind.deleteDirectories;
			uris: ReadonlyArray<Uri>;
	  }>
	| Readonly<{
			kind: MessageKind.createFile;
			newUri: Uri;
			newContentUri: Uri;
			deleteNewContentUri: boolean;
	  }>
	| Readonly<{
			kind: MessageKind.moveFile;
			newUri: Uri;
			oldUri: Uri;
			newContentUri: Uri;
	  }>
	| Readonly<{
			kind: MessageKind.showProgress;
			codemodHash: CodemodHash | null;
			progressKind: 'finite' | 'infinite';
			totalFileNumber: number;
			processedFileNumber: number;
	  }>
	| Readonly<{
			kind: MessageKind.mainWebviewViewVisibilityChange;
	  }>
	| Readonly<{
			kind: MessageKind.executionQueueChange;
			queuedCodemodHashes: ReadonlyArray<CodemodHash>;
	  }>
	| Readonly<{
			kind: MessageKind.loadHomeDirectoryData;
	  }>
	| Readonly<{
			kind: MessageKind.loadHomeDirectoryCase;
			caseHashDigest: CaseHash;
	  }>
	| Readonly<{
			kind: MessageKind.codemodEngineNodeLocated;
			codemodEngineNodeLocated: boolean;
	  }>;

type EmitterMap<K extends MessageKind> = {
	[k in K]?: EventEmitter<Message & { kind: K }>;
};

export class MessageBus {
	#disposables: Disposable[] | undefined = undefined;

	#emitters: EmitterMap<MessageKind> = {};

	public setDisposables(disposables: Disposable[]): void {
		this.#disposables = disposables;
	}

	subscribe<K extends MessageKind>(
		kind: K,
		fn: (message: Message & { kind: K }) => void,
	) {
		let emitter = this.#emitters[kind] as
			| EventEmitter<Message & { kind: K }>
			| undefined;

		if (!emitter) {
			emitter = new EventEmitter<Message & { kind: K }>();

			this.#emitters[kind] = emitter;
		}

		return emitter.event(fn, this.#disposables);
	}

	publish(message: Message): void {
		let emitter = this.#emitters[message.kind];

		emitter?.fire(message);
	}
}
