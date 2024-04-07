import type { OperationMessage } from "./messages.js";
import { ConsoleKind } from "./schemata/consoleKindSchema.js";
import { boldText, colorizeText } from "./utils.js";
import { WorkerThreadMessage } from "./workerThreadMessages.js";

export type PrinterBlueprint = Readonly<{
	__jsonOutput: boolean;
	printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
	): void;
	printOperationMessage(message: OperationMessage): void;
	printConsoleMessage(kind: ConsoleKind, message: string): void;

	withLoaderMessage(
		cb: (loader: {
			get: (type: "dots" | "whirl" | "vertical-dots") => string;
		}) => string,
	): () => void;
}>;

export class Printer implements PrinterBlueprint {
	private loaderSymbols = {
		dots: [".", "..", "..."],
		"vertical-dots": ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
		whirl: ["\\", "|", "/", "-"],
	};
	private loadingTimer: ReturnType<typeof setInterval> | null = null;
	private loaderStates: {
		[key: string]: { type: "dots" | "whirl" | "vertical-dots"; index: number };
	} = {};

	public constructor(public readonly __jsonOutput: boolean) {}

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
				`Processed %d files out of %d: ${boldText("%s")}`,
				message.processedFileNumber,
				message.totalFileNumber,
				message.processedFileName,
			);
		}
	}

	public printConsoleMessage(kind: ConsoleKind, message: string) {
		if (this.__jsonOutput) {
			return null;
		}

		if (kind === "warn") {
			console.warn(colorizeText(message, "orange"));
		}

		if (kind === "error") {
			console.error(colorizeText(message, "red"));
			return null;
		}

		console[kind](message);
	}

	public withLoaderMessage(
		cb: (loader: {
			get: (type: "dots" | "whirl" | "vertical-dots") => string;
		}) => string,
	): () => void {
		let messageUpdateFunction: () => void;

		const loader = {
			get: (type: "dots" | "whirl" | "vertical-dots"): string => {
				const id = `loader_${Object.keys(this.loaderStates).length}`;
				this.loaderStates[id] = { type, index: 0 };
				return id; // Placeholder for the loader, to be replaced in the message
			},
		};

		(async () => {
			const messageTemplate = cb(loader); // Get the message template with loader placeholders
			messageUpdateFunction = () => {
				let message = messageTemplate;
				for (const [id, loaderState] of Object.entries(this.loaderStates)) {
					const symbols = this.loaderSymbols[loaderState.type];
					message = message.replace(id, symbols[loaderState.index]!);
					loaderState.index = (loaderState.index + 1) % symbols.length; // Update for next tick
				}
				// Example output handling; replace with actual output logic
				process.stdout.write(`\r${message}`); // Output the updated message
			};

			this.loadingTimer = setInterval(messageUpdateFunction, 250);
		})();

		return () => {
			if (this.loadingTimer) {
				clearInterval(this.loadingTimer);
				this.loadingTimer = null;
			}
			this.loaderStates = {}; // Reset loader states
			process.stdout.write("\n");
		};
	}
}
