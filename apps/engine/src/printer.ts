import type { OperationMessage } from './messages.js';
import { ConsoleKind } from './schemata/consoleKindSchema.js';
import { WorkerThreadMessage } from './workerThreadMessages.js';

export type PrinterBlueprint = Readonly<{
	printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: 'console' }),
	): void;
	printOperationMessage(message: OperationMessage): void;
	printConsoleMessage(kind: ConsoleKind, message: string): void;
}>;

export class Printer implements PrinterBlueprint {
	public constructor(private readonly __useJson: boolean) {}

	public printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: 'console' }),
	) {
		if (message.kind === 'console') {
			this.printConsoleMessage(message.consoleKind, message.message);
			return;
		}

		this.printOperationMessage(message);
	}

	public printOperationMessage(message: OperationMessage) {
		if (this.__useJson) {
			if (message.kind === 'error') {
				console.error(JSON.stringify(message));
				return;
			}

			console.log(JSON.stringify(message));
			return;
		}

		if (message.kind === 'error') {
			console.error(message.message);
		}

		if (message.kind === 'progress') {
			console.log(
				'Processed %d files out of %d',
				message.processedFileNumber,
				message.totalFileNumber,
			);
		}

		if (message.kind === 'names') {
			for (const name of message.names) {
				console.log(name);
			}
		}
	}

	public printConsoleMessage(kind: ConsoleKind, message: string) {
		if (this.__useJson) {
			return;
		}

		console[kind](message);
	}
}
