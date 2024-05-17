import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import { backOff } from 'exponential-backoff';
import keytar from 'keytar';
import { confirmUserLoggedIn, generateUserLoginIntent } from '../apis.js';
import { getCurrentUserData, openURL } from '../utils.js';

let ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = 'accessTokenRequestedByCLI';

let routeUserToStudioForLogin = (
	printer: PrinterBlueprint,
	sessionId: string,
	iv: string,
) => {
	let success = openURL(
		`${process.env.CODEMOD_HOME_PAGE_URL}?command=${ACCESS_TOKEN_REQUESTED_BY_CLI_KEY}&sessionId=${sessionId}&iv=${iv}`,
	);
	if (!success) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'An unexpected error occurred while redirecting to the sign-in page. Please submit a GitHub issue (github.com/codemod-com/codemod/issues/new) or report it to us (codemod.com/community).',
		});
	}
};
export let handleLoginCliCommand = async (printer: PrinterBlueprint) => {
	let userData = await getCurrentUserData();
	if (userData !== null) {
		printer.printConsoleMessage(
			'info',
			chalk.bold.cyan("You're already logged in."),
		);
		return;
	}

	let { id: sessionId, iv: initVector } = await generateUserLoginIntent();

	routeUserToStudioForLogin(printer, sessionId, initVector);
	let spinner = printer.withLoaderMessage(
		chalk.cyan('Redirecting to Codemod sign-in page'),
	);
	try {
		let token = await backOff(
			() => confirmUserLoggedIn(sessionId, initVector),
			{
				numOfAttempts: 60, // 1 minute to login
				startingDelay: 1000, // ms
				timeMultiple: 1, // * 1
			},
		);

		await keytar.setPassword('codemod.com', 'user-account', token);

		spinner.succeed();
		printer.printConsoleMessage(
			'info',
			chalk.bold.cyan('You are successfully logged in.'),
		);
	} catch (e) {
		spinner.fail();
		throw new Error('Could not validate access token. Please try again.');
	}
};
