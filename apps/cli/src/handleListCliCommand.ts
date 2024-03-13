import columnify from "columnify";
import { getCodemodList } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

export const handleListNamesCommand = async (options: {
	printer: PrinterBlueprint;
	name?: string;
	short?: boolean;
}) => {
	const { printer, name, short } = options;

	const configObjects = await getCodemodList({ name });

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

	if (configObjects.length > 0) {
		printer.printConsoleMessage(
			"info",
			"\nColored codemods are verified by the Codemod.com engineering team",
		);
	}
};
