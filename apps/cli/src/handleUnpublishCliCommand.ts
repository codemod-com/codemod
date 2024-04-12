import {
	extractLibNameAndVersion,
	isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { unpublish } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText, getCurrentUserData } from "./utils.js";

export const handleUnpublishCliCommand = async (
	printer: PrinterBlueprint,
	name: string,
	force?: boolean,
) => {
	const userData = await getCurrentUserData();

	if (userData === null) {
		throw new Error(
			"To be able to unpublish your codemods, please log in first.",
		);
	}

	const { libName: codemodName, version } = extractLibNameAndVersion(name);

	if (
		isNeitherNullNorUndefined(codemodName) &&
		!isNeitherNullNorUndefined(version) &&
		!force
	) {
		throw new Error(
			`Please provide the version of the codemod you want to unpublish. If you want to unpublish all versions, use the "${colorizeText(
				"--force (-f)",
				"orange",
			)}" flag.`,
		);
	}

	const {
		user: { username },
		token,
	} = userData;

	const spinner = printer.withLoaderMessage(
		colorizeText(`Unpublishing ${boldText(`"${name}"`)}`, "cyan"),
	);

	try {
		await unpublish(token, name);
		spinner.succeed();
	} catch (error) {
		spinner.fail();
		const message =
			error instanceof AxiosError ? error.response?.data.error : String(error);
		const errorMessage = `${boldText(
			`Could not unpublish the "${name}" codemod`,
		)}:\n${message}`;
		printer.printOperationMessage({ kind: "error", message: errorMessage });
		return;
	}

	printer.printConsoleMessage(
		"info",
		boldText(
			colorizeText(
				`Codemod "${boldText(name)}" was successfully unpublished.`,
				"cyan",
			),
		),
	);
};
