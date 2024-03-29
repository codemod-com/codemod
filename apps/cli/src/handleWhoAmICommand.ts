import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { validateAccessToken } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleWhoAmICommand = async (printer: PrinterBlueprint) => {
	const codemodDirectoryPath = join(homedir(), ".codemod");

	const tokenTxtPath = join(codemodDirectoryPath, "token.txt");
	if (!existsSync(tokenTxtPath)) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				boldText("To use this command, please log in first."),
				"red",
			),
		);
		return;
	}

	const content = await readFile(tokenTxtPath, {
		encoding: "utf-8",
	});

	const { username } = await validateAccessToken(content);

	if (username === null) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				boldText("Your session has ended, please log in again."),
				"red",
			),
		);
		return;
	}

	printer.printConsoleMessage(
		"info",
		colorizeText(`You are logged in as ${boldText(username)}.`, "cyan"),
	);
};
