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
		printer.printConsoleMessage(
			"info",
			boldText(colorizeText(`Searching for ${search}...`, "cyan")),
		);
	}

	const configObjects = await getCodemodList(options);

	// required for vsce
	if (short) {
		const names = configObjects.map(({ name }) => name);
		printer.printOperationMessage({ kind: "names", names });
		return;
	}

	let prettified = configObjects
		.map(({ name, verified: _, tags: tagsArray, engine, author }) => {
			const tags = tagsArray.join(", ");

			if (search && (name === search || tags.includes(search))) {
				return {
					name: boldText(colorizeText(name, "cyan")),
					tags: boldText(colorizeText(tags, "cyan")),
					engine: boldText(colorizeText(engine, "cyan")),
					author: boldText(colorizeText(author, "cyan")),
				};
			}

			return {
				name,
				tags,
				engine,
				author,
			};
		})
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	if (search) {
		prettified = prettified.slice(0, 10);
		printer.printConsoleMessage(
			"info",
			boldText(colorizeText("Here are the top search results:\n", "cyan")),
		);
	}

	printer.printConsoleMessage(
		"info",
		columnify(prettified, {
			headingTransform: (heading) => boldText(heading.toLocaleUpperCase()),
		}),
	);
};
