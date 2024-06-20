import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import {
	doubleQuotify,
	extractLibNameAndVersion,
	isNeitherNullNorUndefined,
} from '@codemod-com/utilities';
import { AxiosError } from 'axios';
import { unpublish } from '../apis.js';
import { getCurrentUserData } from '../utils.js';

export let handleUnpublishCliCommand = async (options: {
	printer: PrinterBlueprint;
	name: string;
	force?: boolean;
}) => {
	let { printer, name, force } = options;

	let userData = await getCurrentUserData();

	if (userData === null) {
		throw new Error(
			'To be able to unpublish your codemods, please log in first.',
		);
	}

	let { libName: codemodName, version } = extractLibNameAndVersion(name);

	if (
		isNeitherNullNorUndefined(codemodName) &&
		!isNeitherNullNorUndefined(version) &&
		!force
	) {
		throw new Error(
			`Please provide the version of the codemod you want to unpublish. If you want to unpublish all versions, use the "${chalk.bold(
				'--force (-f)',
			)}" flag.`,
		);
	}

	let { token } = userData;

	let spinner = printer.withLoaderMessage(
		chalk.cyan('Unpublishing ', chalk.bold(doubleQuotify(name))),
	);

	try {
		await unpublish(token, name);
		spinner.succeed();
	} catch (error) {
		spinner.fail();
		let message =
			error instanceof AxiosError
				? error.response?.data.error
				: String(error);
		let errorMessage = `${chalk.bold(
			`Could not unpublish the "${name}" codemod`,
		)}:\n${message}`;
		printer.printOperationMessage({ kind: 'error', message: errorMessage });
		return;
	}

	printer.printConsoleMessage(
		'info',
		chalk.cyan(
			'Codemod',
			chalk.bold(doubleQuotify(name)),
			'was successfully unpublished.',
		),
	);
};
