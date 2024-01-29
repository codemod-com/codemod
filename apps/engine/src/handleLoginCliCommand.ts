import type { PrinterBlueprint } from './printer.js';
import { openURL } from './utils.js';
import { writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { validateAccessToken } from './apis.js';

const ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = 'accessTokenRequestedByCLI';

export const handleLoginCliCommand = async (
	printer: PrinterBlueprint,
	token: string | null,
) => {
	if (token === null) {
		printer.printConsoleMessage(
			'info',
			'Opening the Codemod Studio... Please Sign in with Github!',
		);
		const success = openURL(
			`https://codemod.studio/?command=${ACCESS_TOKEN_REQUESTED_BY_CLI_KEY}`,
		);
		if (!success) {
			printer.printOperationMessage({
				kind: 'error',
				message:
					'Unexpected error occurred while opening the Codemod Studio.',
			});
		}
		return;
	}

	const { username } = await validateAccessToken(token);

	if (username === null) {
		throw new Error(
			'The username of the current user is not known. Aborting the operation.',
		);
	}

	const tokenTxtPath = join(homedir(), '.intuita', 'token.txt');

	await writeFile(tokenTxtPath, token, 'utf-8');

	printer.printConsoleMessage(
		'info',
		'You are successfully logged in with the Codemod CLI!',
	);
};
