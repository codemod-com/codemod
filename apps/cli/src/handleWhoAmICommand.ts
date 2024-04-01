import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText, getCurrentUser } from "./utils.js";

export const handleWhoAmICommand = async (printer: PrinterBlueprint) => {
	const username = await getCurrentUser();

	if (username === null) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				boldText("To use this command, please log in first."),
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
