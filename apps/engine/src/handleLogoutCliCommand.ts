import { readFile, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { revokeCLIToken } from './apis.js';
import type { PrinterBlueprint } from './printer.js';

export const handleLogoutCliCommand = async (printer: PrinterBlueprint) => {
	const tokenTxtPath = join(homedir(), '.intuita', 'token.txt');

	let token: string;

	try {
		token = await readFile(tokenTxtPath, 'utf-8');
	} catch (err) {
		printer.printConsoleMessage('info', 'You are already logged out.');
		return;
	}

	try {
		await revokeCLIToken(token.trim());
	} catch (err) {
		// Don't inform user if something went wrong, just delete the token file.
	}

	await unlink(tokenTxtPath);

	printer.printConsoleMessage('info', 'You have successfully logged out.');
};
