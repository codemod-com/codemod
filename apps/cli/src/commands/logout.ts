import { revokeCLIToken } from "../apis.js";
import type { PrinterBlueprint } from "../printer.js";
import { getCurrentUserData } from "../utils.js";

export const handleLogoutCliCommand = async (printer: PrinterBlueprint) => {
	const userData = await getCurrentUserData();

	if (userData === null) {
		printer.printConsoleMessage("info", "You are already logged out.");
		return;
	}

	try {
		await revokeCLIToken(userData.token);
	} catch (err) {
		//
	}

	printer.printConsoleMessage("info", "You have been successfully logged out.");
};
