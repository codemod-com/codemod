import columnify from "columnify";
import { getCodemodList } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleListNamesCommand = async (options: {
	printer: PrinterBlueprint;
	name?: string;
	tag?: string;
	short?: boolean;
}) => {
	const { printer, name: searchName, tag: searchTag, short } = options;

	if ((searchName || searchTag) && !short) {
		printer.printConsoleMessage(
			"info",
			boldText(`Searching for ${searchName ?? searchTag}...`),
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
		.map(({ name, tags, engine, author }) => {
			if (searchName || searchTag) {
				if (
					(searchName && name === searchName) ||
					(searchTag && tags.includes(searchTag))
				) {
					return {
						name: boldText(name),
						engine: boldText(engine),
						author: boldText(author),
					};
				}
				// Only highlight codemod.com codemods if no search is performed
			} else if (author?.toLocaleLowerCase() === "codemod.com") {
				return {
					name: boldText(colorizeText(name, "cyan")),
					engine: boldText(colorizeText(engine, "cyan")),
					author: boldText(colorizeText(author, "cyan")),
				};
			}

			return {
				name,
				engine,
				author: author ?? "Community",
			};
		})
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	if ((searchName || searchTag) && !short) {
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
			dataTransform: (data) => {
				const lowerCaseData = data.toLocaleLowerCase();

				if (lowerCaseData.includes("codemod.com")) {
					return boldText(colorizeText(data, "cyan"));
				}

				return data;
			},
		}),
	);

	if (configObjects.length > 0 && !searchName && !searchTag) {
		printer.printConsoleMessage(
			"info",
			"\nColored codemods are verified by the Codemod.com engineering team",
		);
	}
};
