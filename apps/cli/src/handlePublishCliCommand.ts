import { createHash } from "crypto";
import * as fs from "fs";
import { mkdir, writeFile } from "fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import FormData from "form-data";
import { object, optional, parse, string } from "valibot";
import { publish, validateAccessToken } from "./apis.js";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText } from "./utils.js";

const packageJsonSchema = object({
	main: string(),
	name: string(),
	license: optional(string()),
});

const getToken = (): Promise<string> => {
	const configurationDirectoryPath = join(homedir(), ".codemod");
	const tokenTxtPath = join(configurationDirectoryPath, "token.txt");

	try {
		return fs.promises.readFile(tokenTxtPath, "utf-8");
	} catch (error) {
		throw new Error(
			`Log in first using the 'codemod login' command to publish codemods.`,
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

	printer.printConsoleMessage("info", `You are logged in as '${username}'.`);

	const packageJsonData = await fs.promises.readFile(
		join(source, "package.json"),
		{
			encoding: "utf-8",
		},
	);

	const pkg = parse(packageJsonSchema, JSON.parse(packageJsonData));

	if (pkg.license !== "MIT" && pkg.license !== "Apache-2.0") {
		throw new Error(
			`Please provide a "MIT" or "Apache-2.0" license in your package.json's "license" field to publish your codemod.`,
		);
	}

	if (
		!pkg.name.startsWith(`@${username}/`) ||
		!/[a-zA-Z0-9_/-]+/.test(pkg.name)
	) {
		throw new Error(
			`The "name" field in package.json must start with your GitHub username and a slash ("@${username}/")and contain allowed characters (a-z, A-Z, 0-9, _, / or -)`,
		);
	}

	const indexCjsData = await fs.promises.readFile(join(source, pkg.main), {
		encoding: "utf-8",
	});

	// We currently support publishing jscodeshift codemods only
	const configJsonData = JSON.stringify(
		{
			schemaVersion: "1.0.0",
			name: pkg.name,
			engine: "jscodeshift",
		},
		null,
		2,
	);

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
		`Publishing the "${pkg.name}" codemod to the Codemod Registry.`,
	);

	const formData = new FormData();
	formData.append("index.cjs", Buffer.from(indexCjsData));
	formData.append("config.json", Buffer.from(configJsonData));

	if (descriptionMdData) {
		formData.append("description.md", descriptionMdData);
	}

	try {
		await publish(token, formData);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const errorMessage = `Could not publish the "${pkg.name}" codemod: ${message}`;
		printer.printConsoleMessage("error", errorMessage);
		throw new Error(errorMessage);
	}

	printer.printConsoleMessage(
		"info",
		boldText(
			colorizeText(`Successfully published the ${pkg.name} codemod.`, "cyan"),
		),
	);

	const codemodHashDigest = createHash("ripemd160")
		.update(pkg.name)
		.digest("base64url");

	const codemodDirectoryPath = join(homedir(), ".codemod", codemodHashDigest);

	await mkdir(codemodDirectoryPath, { recursive: true });

	try {
		await writeFile(join(codemodDirectoryPath, "config.json"), configJsonData);
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
				`$ codemod ${pkg.name}`,
			)}`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		throw new Error(
			`Failed to write the codemod files into the local codemod registry: ${message}.`,
		);
	}
};
