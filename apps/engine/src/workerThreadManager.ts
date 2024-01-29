import { Worker } from 'node:worker_threads';
import { FormattedFileCommand } from './fileCommands.js';
import { MainThreadMessage } from './mainThreadMessages.js';
import { OperationMessage } from './messages.js';
import { SafeArgumentRecord } from './safeArgumentRecord.js';
import {
	decodeWorkerThreadMessage,
	WorkerThreadMessage,
} from './workerThreadMessages.js';

const WORKER_THREAD_TIME_LIMIT = 10000;

export class WorkerThreadManager {
	private __finished = false;
	private __idleWorkerIds: number[] = [];
	private __workers: Worker[] = [];
	private __workerTimestamps: number[] = [];
	private __filePaths: string[] = [];
	private __currentFileCount = 0;
	private __totalFileCount: number | null = null;
	private __processedFileNumber = 0;
	private readonly __interval: NodeJS.Timeout;

	public constructor(
		private readonly __workerCount: number,
		private readonly __getData: (path: string) => Promise<string>,
		private readonly __onPrinterMessage: (
			message:
				| OperationMessage
				| (WorkerThreadMessage & { kind: 'console' }),
		) => void,
		private readonly __onCommand: (
			command: FormattedFileCommand,
		) => Promise<void>,
		private readonly __pathGenerator: AsyncGenerator<string, void, void>,
		codemodPath: string,
		codemodEngine: 'ts-morph' | 'jscodeshift',
		codemodSource: string,
		formatWithPrettier: boolean,
		safeArgumentRecord: SafeArgumentRecord,
	) {
		for (let i = 0; i < __workerCount; ++i) {
			this.__idleWorkerIds.push(i);
			this.__workerTimestamps.push(Date.now());

			const filename = process.env.TEST ? './dist/index.cjs' : __filename;

			const worker = new Worker(filename);

			worker.on('message', this.__buildOnWorkerMessage(i));

			worker.postMessage({
				kind: 'initialization',
				codemodPath,
				codemodEngine,
				codemodSource,
				formatWithPrettier,
				safeArgumentRecord,
			} satisfies MainThreadMessage);

			this.__workers.push(worker);
		}

		this.__onPrinterMessage({
			kind: 'progress',
			processedFileNumber: 0,
			totalFileNumber: this.__currentFileCount,
		});

		this.__interval = setInterval(() => {
			const now = Date.now();

			for (let i = 0; i < __workerCount; ++i) {
				const timestamp = this.__workerTimestamps[i] ?? Date.now();

				if (now > timestamp + WORKER_THREAD_TIME_LIMIT) {
					// hanging promise on purpose
					this.__workers[i]?.terminate();

					const filename = process.env.TEST
						? './dist/index.cjs'
						: __filename;

					const worker = new Worker(filename);
					worker.on('message', this.__buildOnWorkerMessage(i));

					this.__workers[i] = worker;

					this.__idleWorkerIds.push(i);

					this.__workerTimestamps[i] = Date.now();
				}
			}
		}, 1000);

		this.__pullNewPath();
	}

	public async terminateWorkers() {
		if (this.__finished) {
			return;
		}

		clearInterval(this.__interval);

		for (const worker of this.__workers) {
			await worker.terminate();
		}
	}

	private async __pullNewPath() {
		const iteratorResult = await this.__pathGenerator.next();

		if (iteratorResult.done) {
			this.__totalFileCount = this.__currentFileCount;

			return;
		}

		++this.__currentFileCount;

		this.__filePaths.push(iteratorResult.value);

		await this.__work();

		await this.__pullNewPath();
	}

	private async __work(): Promise<void> {
		if (this.__finished) {
			return;
		}

		const filePath = this.__filePaths.pop();

		if (filePath === undefined) {
			if (
				this.__totalFileCount !== null &&
				this.__idleWorkerIds.length === this.__workerCount
			) {
				this.__finished = true;

				this.__finish();
			}

			return;
		}

		const id = this.__idleWorkerIds.pop();

		if (id === undefined) {
			this.__filePaths.push(filePath);

			return;
		}

		const data = await this.__getData(filePath);

		this.__workers[id]?.postMessage({
			kind: 'runCodemod',
			path: filePath,
			data,
		} satisfies MainThreadMessage);

		this.__workerTimestamps[id] = Date.now();

		await this.__work();
	}

	private __finish(): void {
		clearInterval(this.__interval);

		for (const worker of this.__workers) {
			worker.postMessage({ kind: 'exit' } satisfies MainThreadMessage);
		}

		this.__onPrinterMessage({
			kind: 'finish',
		});
	}

	private __buildOnWorkerMessage(i: number) {
		return async (m: unknown): Promise<void> => {
			const workerThreadMessage = decodeWorkerThreadMessage(m);

			if (workerThreadMessage.kind === 'console') {
				this.__onPrinterMessage(workerThreadMessage);
				return;
			}

			if (workerThreadMessage.kind === 'commands') {
				const commands =
					workerThreadMessage.commands as FormattedFileCommand[];

				for (const command of commands) {
					await this.__onCommand(command);
				}
			} else if (workerThreadMessage.kind === 'error') {
				this.__onPrinterMessage({
					kind: 'error',
					message: workerThreadMessage.message,
					path: workerThreadMessage.path,
				});
			}

			++this.__processedFileNumber;

			this.__onPrinterMessage({
				kind: 'progress',
				processedFileNumber: this.__processedFileNumber,
				totalFileNumber: this.__currentFileCount,
			});

			this.__idleWorkerIds.push(i);
			await this.__work();
		};
	}
}
