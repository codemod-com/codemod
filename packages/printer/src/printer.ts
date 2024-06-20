import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import type { ConsoleKind } from './schemata/consoleKindSchema.js';
import type { OperationMessage } from './schemata/messages.js';
import type { WorkerThreadMessage } from './schemata/workerThreadMessages.js';

export type PrinterBlueprint = Readonly<{
	__jsonOutput: boolean;
	printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: 'console' }),
	): void;
	printOperationMessage(message: OperationMessage): void;
	printConsoleMessage(kind: ConsoleKind, message: string): void;

	withLoaderMessage(text: string): Ora;
}>;

export class Printer implements PrinterBlueprint {
	public constructor(public readonly __jsonOutput: boolean) {}

	public printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: 'console' }),
	) {
		if (message.kind === 'console') {
			return this.printConsoleMessage(
				message.consoleKind,
				message.message,
			);
		}

		return this.printOperationMessage(message);
	}

	public printOperationMessage(message: OperationMessage) {
		if (this.__jsonOutput) {
			if (message.kind === 'error') {
				console.error(chalk.red(`\n${JSON.stringify(message)}\n`));
				return;
			}

			console.log(JSON.stringify(message));
			return;
		}

		if (message.kind === 'error') {
			let { message: text, path } = message;

			let errorText: string = text;

			if (path) {
				errorText = `${chalk.bold('Error at', `${path}:`)}\n\n${text}`;
			}

			console.error(chalk.red(`\n${errorText}\n`));
		}

		if (message.kind === 'progress') {
			console.log(
				'%sProcessed %d files out of %d%s',
				message.recipeCodemodName
					? chalk.bold(`(${message.recipeCodemodName})  `)
					: '',
				message.processedFileNumber,
				message.totalFileNumber,
				message.processedFileName
					? `: ${chalk.bold(message.processedFileName)}`
					: '',
			);
		}
	}

	public printConsoleMessage(kind: ConsoleKind, message: string) {
		if (this.__jsonOutput) {
			return null;
		}

		if (kind === 'warn') {
			console.warn(chalk.yellow(message));
		}

		if (kind === 'error') {
			console.error(chalk.red(message));
			return null;
		}

		return console[kind](message);
	}

	public withLoaderMessage(text: string): Ora {
		return ora({ text, color: 'cyan' }).start();
	}
}
