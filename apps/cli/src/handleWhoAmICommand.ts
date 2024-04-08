import type { PrinterBlueprint } from "./printer.js";
import {
	boldText,
	colorizeText,
	getCurrentUserData,
	getOrgsNames,
} from "./utils.js";

export const handleWhoAmICommand = async (printer: PrinterBlueprint) => {
	const userData = await getCurrentUserData();

	if (userData === null) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				boldText("To use this command, please log in first."),
				"red",
			),
		);
		return;
	}

	const { username, organizations } = userData.user;
	printer.printConsoleMessage(
		"info",
		colorizeText(`You are logged in as ${boldText(username)}.`, "cyan"),
	);

	if (organizations.length > 0) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				`You have access to the following organizations: ${boldText(
					`- ${getOrgsNames(userData).join("\n- ")}`,
				)}`,
				"cyan",
			),
		);
	}
};
