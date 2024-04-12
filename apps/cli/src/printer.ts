import ora, { type Ora } from "ora";
import type { OperationMessage } from "./messages.js";
import type { ConsoleKind } from "./schemata/consoleKindSchema.js";
import { boldText, colorizeText } from "./utils.js";
import type { WorkerThreadMessage } from "./workerThreadMessages.js";

export type PrinterBlueprint = Readonly<{
	__jsonOutput: boolean;
	printMessage(
		message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
	): void;
	printOperationMessage(message: OperationMessage): void;
	printConsoleMessage(kind: ConsoleKind, message: string): void;

	withLoaderMessage(text: string): Ora;
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
				"%sProcessed %d files out of %d%s",
				message.recipeCodemodName
					? boldText(`(${message.recipeCodemodName})  `)
					: "",
				message.processedFileNumber,
				message.totalFileNumber,
				message.processedFileName
					? `: ${boldText(message.processedFileName)}`
					: "",
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

	public withLoaderMessage(text: string): Ora {
		return ora({ text, color: "cyan" }).start();
	}
}
