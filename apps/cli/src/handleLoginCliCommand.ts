import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { validateAccessToken } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText, openURL } from "./utils.js";

const ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = "accessTokenRequestedByCLI";

const routeUserToStudioForLogin = (printer: PrinterBlueprint) => {
	printer.printConsoleMessage(
		"info",
		colorizeText("Redirecting to Codemod sign-in page...\n", "cyan"),
	);
	const success = openURL(
		`https://codemod.studio/?command=${ACCESS_TOKEN_REQUESTED_BY_CLI_KEY}`,
	);
	if (!success) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"An unexpected error occurred while redirecting to the sign-in page. Please submit a GitHub issue (github.com/codemod-com/codemod/issues/new) or report it to us (codemod.com/community).",
		});
	}
};
export const handleLoginCliCommand = async (
	printer: PrinterBlueprint,
	token: string | null,
) => {
	const codemodDirectoryPath = join(homedir(), ".codemod");

	if (token === null) {
		const tokenTxtPath = join(codemodDirectoryPath, "token.txt");
		if (!existsSync(tokenTxtPath)) {
			routeUserToStudioForLogin(printer);
			return;
		}

		const content = await readFile(tokenTxtPath, {
			encoding: "utf-8",
		});
		const { username } = await validateAccessToken(content);

		if (username === null) {
			routeUserToStudioForLogin(printer);
			return;
		}

		printer.printConsoleMessage(
			"info",
			colorizeText(boldText("You're already logged in."), "cyan"),
		);
		return;
	}

	const { username } = await validateAccessToken(token);

	if (username === null) {
		throw new Error(
			"The username of the current user is not known. Aborting the operation.",
		);
	}

	// Ensure that `/.codemod.` folder exists
	await mkdir(codemodDirectoryPath, { recursive: true });

	const tokenTxtPath = join(codemodDirectoryPath, "token.txt");
	await writeFile(tokenTxtPath, token, "utf-8");

	printer.printConsoleMessage(
		"info",
		colorizeText(boldText("You are successfully logged in."), "cyan"),
	);
};
