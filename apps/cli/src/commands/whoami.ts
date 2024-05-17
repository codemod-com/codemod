import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import { getCurrentUserData, getOrgsNames } from '../utils.js';

export let handleWhoAmICommand = async (printer: PrinterBlueprint) => {
	let userData = await getCurrentUserData();

	if (userData === null) {
		printer.printConsoleMessage(
			'info',
			chalk.bold.red('To use this command, please log in first.'),
		);
		return;
	}

	let { username, organizations } = userData.user;
	printer.printConsoleMessage(
		'info',
		chalk.cyan('You are logged in as', `${chalk.bold(username)}.`),
	);

	if (organizations.length > 0) {
		printer.printConsoleMessage(
			'info',
			chalk.cyan(
				'You have access to the following organizations:\n',
				chalk.bold(`- ${getOrgsNames(userData).join('\n- ')}`),
			),
		);
	}
};
