import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { validateAccessToken } from './apis.js';
import type { PrinterBlueprint } from './printer.js';
import { boldText, colorizeText, openURL } from './utils.js';

const ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = 'accessTokenRequestedByCLI';

export const handleLoginCliCommand = async (
	printer: PrinterBlueprint,
	token: string | null,
) => {
	if (token === null) {
		printer.printConsoleMessage(
			'info',
			colorizeText(
				'Opening the Codemod Studio... Please Sign in with Github!\n',
				'cyan',
			),
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

	// Ensure that `/.codemod.` folder exists
	const codemodDirectoryPath = join(homedir(), '.codemod');
	await mkdir(codemodDirectoryPath, { recursive: true });

	const tokenTxtPath = join(homedir(), '.codemod', 'token.txt');
	await writeFile(tokenTxtPath, token, 'utf-8');

	printer.printConsoleMessage(
		'info',
		colorizeText(
			boldText('You are successfully logged in with the Codemod CLI!'),
			'cyan',
		),
	);
};
