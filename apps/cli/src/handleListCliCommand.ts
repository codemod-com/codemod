import columnify from "columnify";
import { getCodemodList } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleListNamesCommand = async (
	printer: PrinterBlueprint,
	short?: boolean,
) => {
	const configObjects = await getCodemodList();

	// required for vsce
	if (short) {
		const names = configObjects.map(({ name }) => name);
		printer.printOperationMessage({ kind: "names", names });
		return;
	}

	const prettified = configObjects
		.map(({ name, engine, author }) => {
			if (author?.toLocaleLowerCase() === "codemod.com") {
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

	printer.printConsoleMessage(
		"info",
		columnify(prettified, {
			headingTransform: (heading) => boldText(heading.toLocaleUpperCase()),
		}),
	);

	printer.printConsoleMessage(
		"info",
		"\nColored codemods are verified by the Codemod.com engineering team",
	);
};
