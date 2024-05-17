import type { PrinterBlueprint } from '@codemod-com/printer';
import { revokeCLIToken } from '../apis.js';
import { getCurrentUserData } from '../utils.js';

export let handleLogoutCliCommand = async (printer: PrinterBlueprint) => {
	let userData = await getCurrentUserData();

	if (userData === null) {
		printer.printConsoleMessage('info', 'You are already logged out.');
		return;
	}

	try {
		await revokeCLIToken(userData.token);
	} catch (err) {
		//
	}

	printer.printConsoleMessage(
		'info',
		'You have been successfully logged out.',
	);
};
