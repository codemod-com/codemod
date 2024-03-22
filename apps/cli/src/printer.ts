import type { OperationMessage } from "./messages.js";
import { ConsoleKind } from "./schemata/consoleKindSchema.js";
import { boldText, colorizeText } from "./utils.js";
import { WorkerThreadMessage } from "./workerThreadMessages.js";

export type PrinterBlueprint = Readonly<{
	printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
	): void;
	printOperationMessage(message: OperationMessage): void;
	printConsoleMessage(kind: ConsoleKind, message: string): void;
}>;

export class Printer implements PrinterBlueprint {
	public constructor(private readonly __jsonOutput: boolean) {}

	public printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
	) {
		if (message.kind === "console") {
			this.printConsoleMessage(message.consoleKind, message.message);
			return;
		}

		this.printOperationMessage(message);
	}

	public printOperationMessage(message: OperationMessage) {
		if (this.__jsonOutput) {
			if (message.kind === "error") {
				console.error(colorizeText(`\n${JSON.stringify(message)}\n`, "red"));
				return;
			}

			console.log(JSON.stringify(message));
			return;
		}

		if (message.kind === "error") {
			const { message: text, path } = message;

			let errorText: string = text;

			if (path) {
				errorText = `${boldText(`Error at ${path}:`)}\n\n${text}`;
			}

			console.error(colorizeText(`\n${errorText}\n`, "red"));
		}

		if (message.kind === "progress") {
			console.log(
				"Processed %d files out of %d",
				message.processedFileNumber,
				message.totalFileNumber,
			);
		}
	}

	public printConsoleMessage(kind: ConsoleKind, message: string) {
		if (this.__jsonOutput) {
			return;
		}

		if (kind === "error") {
			console.error(colorizeText(message, "red"));
			return;
		}

		console[kind](message);
	}
}
