import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { backOff } from "exponential-backoff";
import { confirmUserLoggedIn, generateUserLoginIntent } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText, getCurrentUser, openURL } from "./utils.js";

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
	const username = await getCurrentUser();
	if (username !== null) {
		printer.printConsoleMessage(
			"info",
			colorizeText(boldText("You're already logged in."), "cyan"),
		);
		return;
	}

	const { id: sessionId, iv: initVector } = await generateUserLoginIntent();

	routeUserToStudioForLogin(printer, sessionId, initVector);
	const stopLoading = printer.withLoaderMessage((loader) =>
		colorizeText(
			`${loader.get("vertical-dots")} Redirecting to Codemod sign-in page`,
			"cyan",
		),
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

		const codemodDirectoryPath = join(homedir(), ".codemod");
		const tokenTxtPath = join(codemodDirectoryPath, "token.txt");
		// Ensure that `/.codemod.` folder exists
		await mkdir(codemodDirectoryPath, { recursive: true });

		await writeFile(tokenTxtPath, token, "utf-8");

		stopLoading();
		printer.printConsoleMessage(
			"info",
			colorizeText(boldText("You are successfully logged in."), "cyan"),
		);
	} catch (e) {
		stopLoading();
		throw new Error("Could not validate access token. Please try again.");
	}
};
