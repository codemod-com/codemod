import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import { openURL } from '../utils.js';

export let handleFeedbackCommand = async (options: {
	printer: PrinterBlueprint;
}) => {
	let { printer } = options;
	let feedbackUrl = 'https://go.codemod.com/feedback';

	printer.printConsoleMessage(
		'info',
		chalk.cyan('Redirecting to the feedback page...'),
	);

	let success = openURL(feedbackUrl);
	if (!success) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'Unexpected error occurred while redirecting to the feedback page.',
		});
	}
};
