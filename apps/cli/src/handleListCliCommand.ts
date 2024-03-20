import columnify from "columnify";
import { getCodemodList } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleListNamesCommand = async (options: {
	printer: PrinterBlueprint;
	search?: string;
	short?: boolean;
}) => {
	const { printer, search, short } = options;

	if (search && !short) {
		printer.printConsoleMessage("info", boldText(`Searching for ${search}...`));
	}

	const configObjects = await getCodemodList(options);

	// required for vsce
	if (short) {
		const names = configObjects.map(({ name }) => name);
		printer.printOperationMessage({ kind: "names", names });
		return;
	}

	let prettified = configObjects
		.map(({ name, verified, tags, engine, author }) => {
			if (search && (name === search || tags.includes(search))) {
				return {
					name: boldText(name),
					engine: boldText(engine),
					author: boldText(author),
				};
			}

			// Only highlight verified codemods if no search is performed
			if (!search && verified) {
				return {
					name: boldText(colorizeText(name, "cyan")),
					engine: boldText(colorizeText(engine, "cyan")),
					author: boldText(colorizeText(author, "cyan")),
				};
			}

			return {
				name,
				engine,
				author,
			};
		})
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	if (search && !short) {
		prettified = prettified.slice(0, 10);
		printer.printConsoleMessage(
			"info",
			boldText("Here are the top search results:"),
		);
	}

	printer.printConsoleMessage(
		"info",
		columnify(prettified, {
			headingTransform: (heading) => boldText(heading.toLocaleUpperCase()),
		}),
	);

	if (configObjects.length > 0 && !search) {
		printer.printConsoleMessage(
			"info",
			"\nColored codemods are verified by the Codemod.com engineering team",
		);
	}
};
