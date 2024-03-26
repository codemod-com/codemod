// import { execSync } from "node:child_process";
// import { readFile } from "node:fs/promises";
// import * as yaml from "js-yaml";
// import { PrinterBlueprint } from "./printer.js";

// export const runAstgrep = async (
// 	printer: PrinterBlueprint,
// 	rulePath: string,
// 	targetDirectory: string,
// ): Promise<void> => {
// 	const yamlString = await readFile(rulePath, { encoding: "utf8" });
// 	const yamlObject = yaml.load(yamlString);
// 	const extension = languageToExtension(yamlObject.language);

// 	try {
// 		// Use `which` command to check if the command is available
// 		execSync("which sg");
// 	} catch (error) {
// 		// If `which` command fails, the command is not available
// 		printer.printConsoleMessage(
// 			"info",
// 			"ast-grep is not available, installing it globally",
// 		);
// 		const astInstallCommand = "npm install -g @ast-grep/cli";
// 		if (process.platform === "win32") {
// 			execSync(`powershell -Command ${astInstallCommand}`);
// 		} else {
// 			execSync(astInstallCommand);
// 		}
// 	}

// 	printer.printConsoleMessage(
// 		"info",
// 		`Executing ast-grep for language : ${extension}`,
// 	);

// 	// Function to recursively iterate over files in the directory
// 	const iterateFiles = async (dirPath: string) => {
// 		const entries = await fs.promises.readdir(dirPath, {
// 			withFileTypes: true,
// 		});

// 		// Iterate over each entry in the directory
// 		for (const entry of entries) {
// 			const entryPath = path.join(dirPath, entry.name);
// 			// Check if the entry is a directory
// 			if (entry.isDirectory()) {
// 				// Recursively call the function for subdirectories
// 				await iterateFiles(entryPath);
// 			} else if (entry.isFile()) {
// 				// If the entry is a file, log its path
// 				const fileExtension = path.extname(entryPath).slice(1);
// 				if (fileExtension !== extension) {
// 					continue;
// 				}
// 				const astCommand = `sg scan -r ${rulePath} ${entryPath} -U`;
// 				if (process.platform === "win32") {
// 					execSync(`powershell -Command "${astCommand}"`);
// 				} else {
// 					execSync(astCommand);
// 				}
// 			}
// 		}
// 	};

// 	// await iterateFiles(targetDirectory);
// 	return;
// };

// function languageToExtension(language: string) {
// 	const lang = language.toLocaleLowerCase();
// 	switch (lang) {
// 		case "python":
// 			return "py";
// 		case "javascript":
// 			return "js";
// 		default:
// 			throw new Error(
// 				`Unsupported Language ${language} in codemod cli for ast-grep engine`,
// 			);
// 	}
// }

import { execSync } from "node:child_process";
import vm from "node:vm";
import jscodeshift, { API, FileInfo } from "jscodeshift";
import { nullish, parse, string } from "valibot";
import { buildVmConsole } from "./buildVmConsole.js";
import { CONSOLE_OVERRIDE } from "./consoleOverride.js";
import type { FileCommand } from "./fileCommands.js";
import type { SafeArgumentRecord } from "./safeArgumentRecord.js";
import { ConsoleKind } from "./schemata/consoleKindSchema.js";

export const buildApi = (parser: string): API => ({
	j: jscodeshift.withParser(parser),
	jscodeshift: jscodeshift.withParser(parser),
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	stats: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	report: () => {},
});

const transform = (
	codemodSource: string,
	fileInfo: FileInfo,
	api: API,
	options: {
		// the options will be of type ArgumentRecord
		// after the removal of the createFile function
		[x: string]: unknown;
		createFile: (newPath: string, newData: string) => void;
	},
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): string | undefined | null => {
	const codeToExecute = `
		${CONSOLE_OVERRIDE}

		const __module__ = { exports: {} };

		const keys = ['module', 'exports'];
		const values = [__module__, __module__.exports];

		new Function(...keys, __CODEMOD_SOURCE__).apply(null, values);

		const transform = typeof __module__.exports === 'function'
			? __module__.exports
			: __module__.exports.__esModule &&
			typeof __module__.exports.default === 'function'
			? __module__.exports.default
			: null;

		transform(__CODEMODCOM__file, __CODEMODCOM__api, __CODEMODCOM__options);
	`;

	// Create a new context for the code execution
	const exports = Object.freeze({});

	const context = vm.createContext({
		module: Object.freeze({
			exports,
		}),
		exports,
		__CODEMODCOM__file: fileInfo,
		__CODEMODCOM__api: api,
		__CODEMODCOM__options: options,
		__CODEMODCOM__console__: buildVmConsole(consoleCallback),
		__CODEMOD_SOURCE__: codemodSource,
	});

	const value = vm.runInContext(codeToExecute, context);

	return parse(nullish(string()), value);
};

export const runAstGrepCodemod = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	disablePrettier: boolean,
	safeArgumentRecord: SafeArgumentRecord,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): readonly FileCommand[] => {
	const commands: FileCommand[] = [];

	const createFile = (newPath: string, newData: string): void => {
		commands.push({
			kind: "createFile",
			newPath,
			newData,
			formatWithPrettier: !disablePrettier,
		});
	};

	const api = buildApi("tsx");

	const newData = transform(
		codemodSource,
		{
			path: oldPath,
			source: oldData,
		},
		api,
		{
			...safeArgumentRecord,
			createFile,
		},
		consoleCallback,
	);

	const astCommand = `sg scan -r ${rulePath} ${entryPath} -U`;
	if (process.platform === "win32") {
		execSync(`powershell -Command "${astCommand}"`);
	} else {
		execSync(astCommand);
	}

	if (typeof newData !== "string" || oldData === newData) {
		return commands;
	}

	commands.push({
		kind: "updateFile",
		oldPath,
		oldData: oldData,
		newData,
		formatWithPrettier: !disablePrettier,
	});

	return commands;
};
