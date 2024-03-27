import columnify from "columnify";
import { getCodemodList } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleListNamesCommand = async (options: {
	printer: PrinterBlueprint;
	search?: string;
}) => {
	const { printer, search } = options;

	if (search && printer.__jsonOutput) {
		printer.printConsoleMessage(
			"info",
			boldText(colorizeText(`Searching for ${search}...`, "cyan")),
		);
	}

	const configObjects = await getCodemodList(options);

	if (printer.__jsonOutput) {
		printer.printOperationMessage({
			kind: "codemodList",
			codemods: configObjects,
		});
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

		if (prettified.length === 0) {
			printer.printConsoleMessage(
				"info",
				boldText(colorizeText("No results matched your search.", "red")),
			);
			return;
		}

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
