import { backOff } from "exponential-backoff";
import keytar from "keytar";
import { confirmUserLoggedIn, generateUserLoginIntent } from "../apis.js";
import type { PrinterBlueprint } from "../printer.js";
import {
	boldText,
	colorizeText,
	getCurrentUserData,
	openURL,
} from "../utils.js";

const ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = "accessTokenRequestedByCLI";

const routeUserToStudioForLogin = (
	printer: PrinterBlueprint,
	sessionId: string,
	iv: string,
) => {
	const success = openURL(
		`https://codemod.studio/?command=${ACCESS_TOKEN_REQUESTED_BY_CLI_KEY}&sessionId=${sessionId}&iv=${iv}`,
	);
	if (!success) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"An unexpected error occurred while redirecting to the sign-in page. Please submit a GitHub issue (github.com/codemod-com/codemod/issues/new) or report it to us (codemod.com/community).",
		});
	}
};
export const handleLoginCliCommand = async (printer: PrinterBlueprint) => {
	const userData = await getCurrentUserData();
	if (userData !== null) {
		printer.printConsoleMessage(
			"info",
			colorizeText(boldText("You're already logged in."), "cyan"),
		);
		return;
	}

	const { id: sessionId, iv: initVector } = await generateUserLoginIntent();

	routeUserToStudioForLogin(printer, sessionId, initVector);
	const spinner = printer.withLoaderMessage(
		colorizeText("Redirecting to Codemod sign-in page", "cyan"),
	);
	try {
		const token = await backOff(
			() => confirmUserLoggedIn(sessionId, initVector),
			{
				numOfAttempts: 60, // 1 minute to login
				startingDelay: 1000, // ms
				timeMultiple: 1, // * 1
			},
		);

		await keytar.setPassword("codemod.com", "user-account", token);

		spinner.succeed();
		printer.printConsoleMessage(
			"info",
			colorizeText(boldText("You are successfully logged in."), "cyan"),
		);
	} catch (e) {
		spinner.fail();
		throw new Error("Could not validate access token. Please try again.");
	}
};
