import EventEmitter from 'events';
import { homedir } from 'os';
import { join } from 'path';
import {
	CaseReadingService,
	JOB_KIND,
	SurfaceAgnosticJob,
} from '@intuita-inc/utilities';
import { FileType, Uri, window, workspace } from 'vscode';
import { Store } from '.';
import { Case, CaseHash, caseHashCodec } from '../cases/types';
import { CodemodEntry } from '../codemods/types';
import { MessageBus, MessageKind } from '../components/messageBus';
import { Job, jobHashCodec, JobKind } from '../jobs/types';
import { actions } from './slice';

interface HomeDirectoryEventEmitter extends EventEmitter {
	emit(event: 'start'): boolean;
	emit(event: 'end'): boolean;
	emit(event: 'job', kase: Case, jobs: ReadonlyArray<Job>): boolean;

	once(event: 'start', listener: () => void): this;
	once(event: 'end', listener: () => void): this;
	on(
		event: 'job',
		listener: (kase: Case, jobs: ReadonlyArray<Job>) => void,
	): this;
}

const buildPartialJob = (
	surfaceAgnosticJob: SurfaceAgnosticJob,
): Pick<Job, 'kind' | 'oldUri' | 'newContentUri' | 'newUri'> => {
	if (surfaceAgnosticJob.kind === JOB_KIND.CREATE_FILE) {
		return {
			kind: JobKind.createFile,
			oldUri: null,
			newContentUri: Uri.file(surfaceAgnosticJob.dataUri),
			newUri: Uri.file(surfaceAgnosticJob.pathUri),
		};
	}

	if (surfaceAgnosticJob.kind === JOB_KIND.UPDATE_FILE) {
		return {
			kind: JobKind.rewriteFile,
			oldUri: Uri.file(surfaceAgnosticJob.pathUri),
			newContentUri: Uri.file(surfaceAgnosticJob.newDataUri),
			newUri: null,
		};
	}

	if (surfaceAgnosticJob.kind === JOB_KIND.MOVE_FILE) {
		return {
			kind: JobKind.moveFile,
			oldUri: Uri.file(surfaceAgnosticJob.oldPathUri),
			newContentUri: null,
			newUri: Uri.file(surfaceAgnosticJob.newPathUri),
		};
	}

	if (surfaceAgnosticJob.kind === JOB_KIND.MOVE_AND_UPDATE_FILE) {
		return {
			kind: JobKind.moveFile,
			oldUri: Uri.file(surfaceAgnosticJob.oldPathUri),
			newContentUri: Uri.file(surfaceAgnosticJob.newDataUri),
			newUri: Uri.file(surfaceAgnosticJob.newPathUri),
		};
	}

	if (surfaceAgnosticJob.kind === JOB_KIND.DELETE_FILE) {
		return {
			kind: JobKind.deleteFile,
			oldUri: Uri.file(surfaceAgnosticJob.pathUri),
			newContentUri: null,
			newUri: null,
		};
	}

	if (surfaceAgnosticJob.kind === JOB_KIND.COPY_FILE) {
		return {
			kind: JobKind.deleteFile,
			oldUri: Uri.file(surfaceAgnosticJob.sourcePathUri),
			newContentUri: null,
			newUri: Uri.file(surfaceAgnosticJob.targetPathUri),
		};
	}

	throw new Error('Unsupported surface agnostic job');
};

const readHomeDirectoryCase = async (
	homeDirectoryEventEmitter: HomeDirectoryEventEmitter,
	rootUri: Uri,
	codemodEntities: Record<string, CodemodEntry | undefined>,
	caseDataPath: string,
) => {
	const caseReadingService = new CaseReadingService(caseDataPath);

	let kase: Case | null = null;

	caseReadingService.once('case', (surfaceAgnosticCase) => {
		if (
			!surfaceAgnosticCase.absoluteTargetPath.startsWith(rootUri.fsPath)
		) {
			console.info(
				'The current case does not belong to the opened workspace',
			);
			caseReadingService.emit('finish');
			return;
		}

		if (!caseHashCodec.is(surfaceAgnosticCase.caseHashDigest)) {
			console.error('Could not validate the case hash digest');
			caseReadingService.emit('finish');
			return;
		}

		const codemodName =
			codemodEntities[surfaceAgnosticCase.codemodHashDigest]?.name ??
			surfaceAgnosticCase.codemodHashDigest;

		kase = {
			hash: surfaceAgnosticCase.caseHashDigest,
			codemodName: `${codemodName} (CLI)`,
			codemodHashDigest: surfaceAgnosticCase.codemodHashDigest,
			createdAt: Number(surfaceAgnosticCase.createdAt),
			path: surfaceAgnosticCase.absoluteTargetPath,
		};

		homeDirectoryEventEmitter.emit('job', kase, []);
	});

	const jobHandler = (surfaceAgnosticJob: SurfaceAgnosticJob) => {
		if (!kase) {
			console.error('You need to have a case to create a job');
			caseReadingService.emit('finish');
			return;
		}

		if (!jobHashCodec.is(surfaceAgnosticJob.jobHashDigest)) {
			console.error('Could not validate the job hash digest');
			caseReadingService.emit('finish');
			return;
		}

		const job: Job = {
			hash: surfaceAgnosticJob.jobHashDigest,
			originalNewContent: null,
			codemodName: kase.codemodName,
			createdAt: kase.createdAt,
			caseHashDigest: kase.hash,
			...buildPartialJob(surfaceAgnosticJob),
		};

		homeDirectoryEventEmitter.emit('job', kase, [job]);
	};

	caseReadingService.on('job', jobHandler);

	const TIMEOUT = 120_000;

	return new Promise<void>((resolve, reject) => {
		let timedOut = false;

		const timeout = setTimeout(() => {
			timedOut = true;

			caseReadingService.off('job', jobHandler);
			caseReadingService.emit('finish');

			reject(new Error(`Reading the case timed out after ${TIMEOUT}ms`));
		}, TIMEOUT);

		caseReadingService.once('error', (error) => {
			if (timedOut) {
				return;
			}

			caseReadingService.off('job', jobHandler);

			clearTimeout(timeout);
			reject(error);
		});

		caseReadingService.once('finish', () => {
			if (timedOut) {
				return;
			}

			caseReadingService.off('job', jobHandler);

			clearTimeout(timeout);

			if (kase === null) {
				reject(new Error('Could not extract the case'));
				return;
			}

			resolve();
		});

		caseReadingService.initialize().catch((error) => reject(error));
	});
};

export const readSingleHomeDirectoryCase = async (
	rootUri: Uri,
	codemodEntities: Record<string, CodemodEntry | undefined>,
	caseHashDigest: CaseHash,
) => {
	const path = join(
		homedir(),
		'.codemod',
		'cases',
		caseHashDigest,
		'case.data',
	);

	const eventEmitter: HomeDirectoryEventEmitter = new EventEmitter();

	eventEmitter.once('start', async () => {
		try {
			await readHomeDirectoryCase(
				eventEmitter,
				rootUri,
				codemodEntities,
				path,
			);
		} catch (error) {
			console.error(error);
		}

		eventEmitter.emit('end');
	});

	return eventEmitter;
};

export const readHomeDirectoryCases = async (
	rootUri: Uri,
	codemodEntities: Record<string, CodemodEntry | undefined>,
): Promise<HomeDirectoryEventEmitter | null> => {
	if (rootUri === null) {
		return null;
	}

	const eventEmitter: HomeDirectoryEventEmitter = new EventEmitter();

	eventEmitter.once('start', async () => {
		const casesDirectoryPath = join(homedir(), '.codemod', 'cases');

		const casesDirectoryUri = Uri.file(casesDirectoryPath);

		try {
			const entries = await workspace.fs.readDirectory(casesDirectoryUri);

			const caseDataPaths = entries
				.filter(([, fileType]) => fileType === FileType.Directory)
				.map(([name]) => join(casesDirectoryPath, name, 'case.data'));

			const results = await Promise.allSettled(
				caseDataPaths.map((path) =>
					readHomeDirectoryCase(
						eventEmitter,
						rootUri,
						codemodEntities,
						path,
					),
				),
			);

			for (const result of results) {
				if (result.status === 'rejected') {
					console.error(result.reason);
				}
			}
		} catch (error) {
			console.error(error);
		}

		eventEmitter.emit('end');
	});

	return eventEmitter;
};

export class HomeDirectoryService {
	public constructor(
		private readonly __messageBus: MessageBus,
		private readonly __store: Store,
		private readonly __rootUri: Uri | null,
	) {
		__messageBus.subscribe(MessageKind.loadHomeDirectoryData, async () => {
			if (!this.__rootUri) {
				return;
			}

			const eventEmitter = await readHomeDirectoryCases(
				this.__rootUri,
				this.__store.getState().codemod.entities,
			);

			const jobHandler = (kase: Case, jobs: ReadonlyArray<Job>) => {
				this.__messageBus.publish({
					kind: MessageKind.upsertCase,
					kase,
					jobs,
				});
			};

			eventEmitter?.once('end', () => {
				eventEmitter.off('job', jobHandler);
			});

			eventEmitter?.on('job', jobHandler);

			eventEmitter?.emit('start');
		});

		__messageBus.subscribe(
			MessageKind.loadHomeDirectoryCase,
			async ({ caseHashDigest }) => {
				await this.__handleLoadHomeDirectoryCase(caseHashDigest);
			},
		);
	}

	private async __handleLoadHomeDirectoryCase(caseHashDigest: CaseHash) {
		if (!this.__rootUri) {
			return;
		}

		const eventEmitter = await readSingleHomeDirectoryCase(
			this.__rootUri,
			this.__store.getState().codemod.entities,
			caseHashDigest,
		);

		let caseExists = false;

		const jobHandler = (kase: Case, jobs: ReadonlyArray<Job>) => {
			this.__messageBus.publish({
				kind: MessageKind.upsertCase,
				kase,
				jobs,
			});

			if (!caseExists) {
				caseExists = true;

				this.__store.dispatch(actions.setActiveTabId('codemodRuns'));
				this.__store.dispatch(
					actions.setSelectedCaseHash(caseHashDigest),
				);
			}
		};

		eventEmitter?.once('end', () => {
			if (!caseExists) {
				window.showErrorMessage('The requested dry-run does not exist');
			}

			eventEmitter.off('job', jobHandler);
		});

		eventEmitter?.on('job', jobHandler);

		eventEmitter?.emit('start');
	}
}
