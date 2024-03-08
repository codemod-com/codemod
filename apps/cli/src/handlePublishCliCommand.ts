import { createHash } from "crypto";
import * as fs from "fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { codemodConfigSchema } from "@codemod-com/utilities";
import FormData from "form-data";
import { mkdir, writeFile } from "fs/promises";
import { parse } from "valibot";
import { publish, validateAccessToken } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

const getToken = async (): Promise<string> => {
	const configurationDirectoryPath = join(homedir(), ".codemod");
	const tokenTxtPath = join(configurationDirectoryPath, "token.txt");

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

	let packageJsonData: string;
	try {
		packageJsonData = await fs.promises.readFile(join(source, "package.json"), {
			encoding: "utf-8",
		});
	} catch (error) {
		throw new Error(
			`Could not find the package.json file in the codemod directory: ${error}.`,
		);
	}

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

	const indexCjsPath = join(
		source,
		codemodRc.build?.output ?? "./dist/index.cjs",
	);
	let indexCjsData: string;
	try {
		indexCjsData = await fs.promises.readFile(indexCjsPath, {
			encoding: "utf-8",
		});
	} catch (err) {
		throw new Error(
			`Could not find the main file of the codemod in ${indexCjsPath}. Did you forget to run "codemod build"?`,
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
	formData.append("index.cjs", Buffer.from(indexCjsData));
	formData.append(".codemodrc.json", Buffer.from(codemodRcData));

	if (descriptionMdData) {
		formData.append("description.md", descriptionMdData);
	}

	try {
		await publish(token, formData);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const errorMessage = `Could not publish the "${codemodRc.name}" codemod: ${message}`;
		printer.printConsoleMessage("error", errorMessage);
		throw new Error(errorMessage);
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

	const codemodHashDigest = createHash("ripemd160")
		.update(codemodRc.name)
		.digest("base64url");

	const codemodDirectoryPath = join(homedir(), ".codemod", codemodHashDigest);

	await mkdir(codemodDirectoryPath, { recursive: true });

	try {
		await writeFile(
			join(codemodDirectoryPath, ".codemodrc.json"),
			codemodRcData,
		);
		await writeFile(join(codemodDirectoryPath, "index.cjs"), indexCjsData);
		if (descriptionMdData) {
			await writeFile(
				join(codemodDirectoryPath, "description.md"),
				descriptionMdData,
			);
		}

		printer.printConsoleMessage(
			"info",
			`\nNow, you can run the codemod anywhere:\n${boldText(
				`$ codemod ${codemodRc.name}`,
			)}`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		throw new Error(
			`Failed to write the codemod files into the local codemod registry: ${message}.`,
		);
	}
};
