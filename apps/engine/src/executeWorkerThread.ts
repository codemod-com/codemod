import { parentPort } from 'node:worker_threads';
import { type WorkerThreadMessage } from './workerThreadMessages.js';
import {
	type MainThreadMessage,
	decodeMainThreadMessage,
} from './mainThreadMessages.js';
import { runJscodeshiftCodemod } from './runJscodeshiftCodemod.js';
import { runTsMorphCodemod } from './runTsMorphCodemod.js';
import { buildFormattedFileCommands } from './fileCommands.js';
import { ConsoleKind } from './schemata/consoleKindSchema.js';

class PathAwareError extends Error {
	constructor(public readonly path: string, message?: string | undefined) {
		super(message);
	}
}

const consoleCallback = (consoleKind: ConsoleKind, message: string): void => {
	parentPort?.postMessage({
		kind: 'console',
		consoleKind,
		message,
	} satisfies WorkerThreadMessage);
};

let initializationMessage:
	| (MainThreadMessage & { kind: 'initialization' })
	| null = null;

const messageHandler = async (m: unknown) => {
	try {
		const message = decodeMainThreadMessage(m);

		if (message.kind === 'initialization') {
			initializationMessage = message;
			return;
		}

		if (message.kind === 'exit') {
			parentPort?.off('message', messageHandler);
			return;
		}

		if (initializationMessage === null) {
			throw new Error();
		}

		try {
			const fileCommands =
				initializationMessage.codemodEngine === 'jscodeshift'
					? runJscodeshiftCodemod(
							initializationMessage.codemodSource,
							message.path,
							message.data,
							initializationMessage.formatWithPrettier,
							initializationMessage.safeArgumentRecord,
							consoleCallback,
					  )
					: runTsMorphCodemod(
							initializationMessage.codemodSource,
							message.path,
							message.data,
							initializationMessage.formatWithPrettier,
							initializationMessage.safeArgumentRecord,
							consoleCallback,
					  );

			const commands = await buildFormattedFileCommands(fileCommands);

			parentPort?.postMessage({
				kind: 'commands',
				commands,
			} satisfies WorkerThreadMessage);
		} catch (error) {
			throw new PathAwareError(
				message.path,
				error instanceof Error ? error.message : String(error),
			);
		}
	} catch (error) {
		parentPort?.postMessage({
			kind: 'error',
			message: error instanceof Error ? error.message : String(error),
			path: error instanceof PathAwareError ? error.path : undefined,
		} satisfies WorkerThreadMessage);
	}
};

export const executeWorkerThread = () => {
	parentPort?.on('message', messageHandler);
};
