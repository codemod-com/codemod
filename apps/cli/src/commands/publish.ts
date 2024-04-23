import * as fs from "node:fs";
import { join } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
	codemodNameRegex,
	doubleQuotify,
	execPromise,
	parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { glob } from "fast-glob";
import FormData from "form-data";
import { publish } from "../apis.js";
import { getCurrentUserData } from "../utils.js";

export const handlePublishCliCommand = async (
	printer: PrinterBlueprint,
	source: string,
) => {
	const userData = await getCurrentUserData();

	if (userData === null) {
		throw new Error(
			"To be able to publish to Codemod Registry, please log in first.",
		);
	}

	const {
		user: { username },
		token,
	} = userData;

	const formData = new FormData();

	let codemodRcData: string;
	try {
		const codemodRcBuf = await fs.promises.readFile(
			join(source, ".codemodrc.json"),
		);
		formData.append(".codemodrc.json", codemodRcBuf);
		codemodRcData = codemodRcBuf.toString("utf-8");
	} catch (err) {
		throw new Error(
			"Could not find the .codemodrc.json file in the codemod directory. Please configure your codemod first.",
		);
	}

	const codemodRc = parseCodemodConfig(JSON.parse(codemodRcData));

	if (codemodRc.engine === "recipe") {
		if (codemodRc.names.length < 2) {
			throw new Error(
				`The "names" field in .codemodrc.json must contain at least two names for a recipe codemod.`,
			);
		}

		for (const name of codemodRc.names) {
			if (!codemodNameRegex.test(name)) {
				throw new Error(
					`Each entry in the "names" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
				);
			}
		}
	}

	if (!codemodNameRegex.test(codemodRc.name)) {
		throw new Error(
			`The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
		);
	}

	if (codemodRc.engine !== "recipe") {
		let globSearchPattern: string;
		let actualMainFileName: string;
		let errorOnMissing: string;

		switch (codemodRc.engine) {
			case "ast-grep":
				globSearchPattern = "**/rule.yaml";
				actualMainFileName = "rule.yaml";
				errorOnMissing = `Please create the main "rule.yaml" file first.`;
				break;
			case "piranha":
				globSearchPattern = "**/rules.toml";
				actualMainFileName = "rules.toml";
				errorOnMissing = `Please create the main "rules.toml" file first.`;
				break;
			default:
				globSearchPattern = "dist/index.cjs";
				actualMainFileName = "index.cjs";
				if (codemodRc.build?.input) {
					const inputFiles = await glob(codemodRc.build.input, {
						absolute: true,
						cwd: source,
						onlyFiles: true,
					});
					const entryPoint = inputFiles.at(0);
					if (entryPoint === undefined) {
						errorOnMissing = `Please create the main file under ${chalk.bold(
							codemodRc.build.input,
						)} first.`;
						break;
					}
				}

				if (codemodRc.build?.output) {
					errorOnMissing = `Please make sure the output path in your .codemodrc.json under ${chalk.bold(
						codemodRc.build.output,
					)} flag is correct.`;
					break;
				}

				errorOnMissing =
					"Please make sure your codemod can be built correctly.";
		}

		const locateMainFile = async () => {
			const mainFiles = await glob(
				codemodRc.build?.output ?? globSearchPattern,
				{
					absolute: true,
					ignore: ["**/node_modules/**"],
					cwd: source,
					onlyFiles: true,
				},
			);

			return mainFiles.at(0);
		};

		let mainFilePath = await locateMainFile();
		if (mainFilePath === undefined) {
			const spinner = printer.withLoaderMessage(
				chalk.cyan(
					"Could not find the main file of the codemod. Trying to build...",
				),
			);

			try {
				// Try to build the codemod anyways, and if after build there is still no main file
				// or the process throws - throw an error
				await execPromise("codemod build", { cwd: source });

				mainFilePath = await locateMainFile();
				spinner.succeed();
				// Likely meaning that the "codemod build" command succeeded, but the file was still not found in output
				if (mainFilePath === undefined) {
					throw new Error();
				}
			} catch (error) {
				spinner.fail();
				throw new Error(
					`Could not find the main file of the codemod. ${errorOnMissing}`,
				);
			}
		}

		const mainFileBuf = await fs.promises.readFile(mainFilePath);

		formData.append(actualMainFileName, mainFileBuf);
	}

	try {
		const descriptionMdBuf = await fs.promises.readFile(
			join(source, "README.md"),
		);
		formData.append("description.md", descriptionMdBuf);
	} catch {
		//
	}

	const publishSpinner = printer.withLoaderMessage(
		chalk.cyan(
			"Publishing the codemod using name from",
			chalk.bold(".codemodrc.json"),
			"file:",
			chalk.bold(doubleQuotify(codemodRc.name)),
		),
	);

	try {
		await publish(token, formData);
		publishSpinner.succeed();
	} catch (error) {
		publishSpinner.fail();
		const message =
			error instanceof AxiosError ? error.response?.data.error : String(error);
		const errorMessage = `${chalk.bold(
			`Could not publish the "${codemodRc.name}" codemod`,
		)}:\n${message}`;
		printer.printOperationMessage({ kind: "error", message: errorMessage });
		return;
	}

	printer.printConsoleMessage(
		"info",
		chalk.bold(
			chalk.cyan(
				`Codemod was successfully published to the registry under the name "${codemodRc.name}".`,
			),
		),
	);

	printer.printConsoleMessage(
		"info",
		`\nNow, you can run the codemod anywhere:\n${chalk.bold(
			`$ codemod ${codemodRc.name}`,
		)}`,
	);
};
