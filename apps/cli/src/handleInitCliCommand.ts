import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
	KnownEngines,
	ProjectDownloadInput,
	getCodemodProjectFiles,
} from "@codemod-com/utilities";
import inquirer from "inquirer";
import terminalLink from "terminal-link";
import type { PrinterBlueprint } from "./printer.js";
import { boldText, colorizeText, getCurrentUser } from "./utils.js";

const CODEMOD_ENGINE_CHOICES: KnownEngines[] = [
	"jscodeshift",
	"ts-morph",
	"filemod",
	"ast-grep",
];

type License = "MIT" | "Apache 2.0";
const LICENSE_CHOICES: License[] = ["MIT", "Apache 2.0"];

export const handleInitCliCommand = async (
	printer: PrinterBlueprint,
	noPrompt?: boolean,
) => {
	// TODO:
	// const tags = await getTagsList();
	// const TAGS_CHOICES = tags.map((tag) => ({
	// 	name: tag.name,
	// 	value: tag.aliases.at(0),
	// }));

	let answers: {
		name: string;
		engine: KnownEngines;
		license: License;
		typescript: boolean;
		git: boolean;
		npm: boolean;
	} | null = null;
	if (!noPrompt) {
		answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Provide a name for your codemod:",
			},
			{
				type: "list",
				name: "engine",
				message: "Select a codemod engine you want to build your codemod with:",
				pageSize: CODEMOD_ENGINE_CHOICES.length,
				choices: CODEMOD_ENGINE_CHOICES,
			},
			{
				type: "list",
				name: "license",
				message: "Select a license you want to include with your codemod:",
				pageSize: LICENSE_CHOICES.length,
				choices: LICENSE_CHOICES,
			},
			// TODO:
			// {
			// 	type: "list",
			// 	name: "tags",
			// 	message: "Optionally select tags for your codemod:",
			// 	pageSize: TAGS_CHOICES.length,
			// 	choices: TAGS_CHOICES,
			// },
			{
				type: "confirm",
				name: "typescript",
				message: "Do you want to use TypeScript?",
				default: true,
			},
			{
				type: "confirm",
				name: "git",
				message: "Do you want to initialize an empty git repository?",
				default: false,
			},
			{
				type: "confirm",
				name: "npm",
				message: "Do you want to install npm dependencies?",
				default: false,
			},
		]);
	}

	const username = await getCurrentUser();

	const downloadInput: ProjectDownloadInput = answers
		? {
				engine: answers.engine,
				name: answers.name,
				license: answers.license,
				username,
				// TODO:
				// tags
		  }
		: {
				engine: "jscodeshift",
				name: "my-awesome-codemod",
				license: "MIT",
				username,
				// TODO:
				// tags
		  };

	const files = getCodemodProjectFiles(downloadInput);

	const codemodBaseDir = join(process.cwd(), downloadInput.name);

	const created: string[] = [];
	for (const [path, content] of Object.entries(files)) {
		const filePath = join(codemodBaseDir, path);

		try {
			await mkdir(dirname(filePath), { recursive: true });
			await writeFile(filePath, content);
			created.push(path);
		} catch (err) {
			printer.printConsoleMessage(
				"error",
				colorizeText(
					`Failed to write file ${boldText(path)}: ${
						(err as Error).message
					}. Aborting codemod creation...`,
					"red",
				),
			);

			for (const createdPath of created) {
				try {
					await unlink(join(codemodBaseDir, createdPath));
				} catch (err) {
					//
				}
			}

			return;
		}
	}

	printer.printConsoleMessage(
		"info",
		colorizeText(
			`Codemod package created at ${boldText(codemodBaseDir)}.`,
			"cyan",
		),
	);

	const isJsCodemod =
		answers?.engine === "jscodeshift" ||
		answers?.engine === "ts-morph" ||
		answers?.engine === "filemod" ||
		answers === null;
	if (isJsCodemod) {
		printer.printConsoleMessage(
			"info",
			colorizeText(
				`\nRun ${boldText("`codemod build`")} to build the codemod.`,
				"cyan",
			),
		);
	}

	const howToRunText = `Run ${boldText(
		`\`codemod --source ${codemodBaseDir}\``,
	)} to run the codemod on current working directory (or specify a target using ${colorizeText(
		"--target",
		"orange",
	)} option).`;
	printer.printConsoleMessage("info", colorizeText(howToRunText, "cyan"));

	let publishText = `Run ${boldText(
		"`codemod publish`",
	)} to publish the codemod to the Codemod registry.`;
	if (isJsCodemod) {
		publishText += colorizeText(
			"NOTE: Your codemod has to be built using the build command",
			"orange",
		);
	}
	printer.printConsoleMessage("info", colorizeText(publishText, "cyan"));

	const otherGuidelinesText = `For other guidelines, please visit our documentation at ${terminalLink(
		boldText("https://docs.codemod.com"),
		"https://docs.codemod.com",
	)} or type ${boldText("`codemod --help`")}.`;
	printer.printConsoleMessage(
		"info",
		colorizeText(otherGuidelinesText, "cyan"),
	);
};
