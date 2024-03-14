import * as fs from "fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { codemodConfigSchema } from "@codemod-com/utilities";
import { AxiosError } from "axios";
import FormData from "form-data";
import { parse } from "valibot";
import { publish, validateAccessToken } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

const getToken = async (): Promise<string> => {
	const tokenTxtPath = join(homedir(), ".codemod", "token.txt");

	try {
		return await fs.promises.readFile(tokenTxtPath, "utf-8");
	} catch (error) {
		throw new Error(
			`Log in first using the "codemod login" command to publish codemods.`,
		);
	}
};

export const handlePublishCliCommand = async (
	printer: PrinterBlueprint,
	source: string,
) => {
	const token = await getToken();
	const { username } = await validateAccessToken(token);

	if (username === null) {
		throw new Error(
			"The GitHub username of the current user is not known. Contact Codemod.com.",
		);
	}

	printer.printConsoleMessage(
		"info",
		`You are logged in as '${boldText(
			username,
		)}' and able to publish a codemod to our public registry.`,
	);

	let codemodRcData: string;
	try {
		codemodRcData = await fs.promises.readFile(
			join(source, ".codemodrc.json"),
			{
				encoding: "utf-8",
			},
		);
	} catch (err) {
		throw new Error(
			"Could not find the .codemodrc.json file in the codemod directory. Please configure your codemod first.",
		);
	}

	const codemodRc = parse(codemodConfigSchema, JSON.parse(codemodRcData));

	if (!("name" in codemodRc) || !/[a-zA-Z0-9_/@-]+/.test(codemodRc.name)) {
		throw new Error(
			`The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
		);
	}

	let actualMainFileName: string;
	let ruleOrExecutablePath: string;
	let errorOnMissing: string;

	switch (codemodRc.engine) {
		case "ast-grep":
			ruleOrExecutablePath = "rule.yaml";
			actualMainFileName = "rule.yaml";
			errorOnMissing = `Please create the main "rule.yaml" file first.`;
			break;
		case "piranha":
			ruleOrExecutablePath = "rules.toml";
			actualMainFileName = "rules.toml";
			errorOnMissing = `Please create the main "rules.toml" file first.`;
			break;
		default:
			ruleOrExecutablePath = codemodRc.build?.output ?? "dist/index.cjs";
			actualMainFileName = "index.cjs";
			errorOnMissing = `Did you forget to run "codemod build"?`;
	}

	let mainFileData: string;
	try {
		mainFileData = await fs.promises.readFile(
			join(source, ruleOrExecutablePath),
			{ encoding: "utf-8" },
		);
	} catch (err) {
		throw new Error(
			`Could not find the main file of the codemod in ${ruleOrExecutablePath}. ${errorOnMissing}`,
		);
	}

	let descriptionMdData: string | null = null;
	try {
		descriptionMdData = await fs.promises.readFile(join(source, "README.md"), {
			encoding: "utf-8",
		});
	} catch {
		//
	}

	printer.printConsoleMessage(
		"info",
		`Publishing the "${codemodRc.name}" codemod to the Codemod Registry.`,
	);

	const formData = new FormData();
	formData.append(actualMainFileName, Buffer.from(mainFileData));
	formData.append(".codemodrc.json", Buffer.from(codemodRcData));

	if (descriptionMdData) {
		formData.append("description.md", descriptionMdData);
	}

	try {
		await publish(token, formData);
	} catch (error) {
		const message =
			error instanceof AxiosError ? error.response?.data.error : String(error);
		const errorMessage = `${boldText(
			`Could not publish the "${codemodRc.name}" codemod`,
		)}:\n${message}`;
		printer.printOperationMessage({ kind: "error", message: errorMessage });
		return;
	}

	printer.printConsoleMessage(
		"info",
		boldText(
			colorizeText(
				`Successfully published the ${codemodRc.name} codemod.`,
				"cyan",
			),
		),
	);

	printer.printConsoleMessage(
		"info",
		`\nNow, you can run the codemod anywhere:\n${boldText(
			`$ codemod ${codemodRc.name}`,
		)}`,
	);
};
