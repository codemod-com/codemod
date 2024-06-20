import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import { doubleQuotify } from '@codemod-com/utilities';
import columnify from 'columnify';
import { getCodemodList } from '../apis.js';

export let handleListNamesCommand = async (
	printer: PrinterBlueprint,
	search: string | null,
) => {
	let spinner: ReturnType<typeof printer.withLoaderMessage> | null = null;
	if (search && !printer.__jsonOutput) {
		spinner = printer.withLoaderMessage(
			chalk.cyan('Searching for', chalk.bold(doubleQuotify(search))),
		);
	}

	let configObjects = await getCodemodList({ search });
	spinner?.stop();

	if (printer.__jsonOutput) {
		printer.printOperationMessage({
			kind: 'codemodList',
			codemods: configObjects,
		});
		return;
	}

	let prettified = configObjects.map(
		({ name, verified: _, tags: tagsArray, engine, author }) => {
			let tags = tagsArray.join(', ');

			if (search && (name === search || tagsArray.includes(search))) {
				return {
					name: chalk.bold.cyan(name),
					tags: chalk.bold.cyan(tags),
					engine: chalk.bold.cyan(engine),
					author: chalk.bold.cyan(author),
				};
			}

			return {
				name,
				tags,
				engine,
				author,
			};
		},
	);

	if (search) {
		prettified = prettified.slice(0, 10);

		if (prettified.length === 0) {
			printer.printConsoleMessage(
				'info',
				chalk.bold.red('No results matched your search.'),
			);
			return;
		}

		printer.printConsoleMessage(
			'info',
			chalk.bold.cyan('Here are the top search results:\n'),
		);
	}

	printer.printConsoleMessage(
		'info',
		columnify(prettified, {
			headingTransform: (heading) =>
				chalk.bold(heading.toLocaleUpperCase()),
		}),
	);
};
