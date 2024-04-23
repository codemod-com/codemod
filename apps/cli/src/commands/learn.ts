import { execSync } from "node:child_process";
import { dirname, extname } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { type KnownEngines, doubleQuotify } from "@codemod-com/utilities";
import { Project } from "ts-morph";
import { createCodeDiff } from "../apis.js";
import {
	findLastlyModifiedFile,
	findModifiedFiles,
	getGitDiffForFile,
	getLatestCommitHash,
	isFileInGitDirectory,
} from "../gitCommands.js";
import { openURL } from "../utils.js";

// remove all special characters and whitespaces
const removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, "").replace(/\s/g, "");

const isJSorTS = (name: string) =>
	name.startsWith(".ts") || name.startsWith(".js");

const getFileExtension = (filePath: string) => {
	return extname(filePath).toLowerCase();
};

const getOldSourceFile = (
	commitHash: string,
	filePath: string,
	fileExtension: string,
) => {
	if (!isJSorTS(fileExtension)) {
		return null;
	}

	try {
		const commitWithFileName = doubleQuotify(`${commitHash}:${filePath}`);
		const output = execSync(`git show ${commitWithFileName}`).toString();

		const project = new Project({
			useInMemoryFileSystem: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		return project.createSourceFile(filePath, output);
	} catch (error) {
		console.error(error);
		return null;
	}
};

const getSourceFile = (filePath: string, fileExtension: string) => {
	if (!isJSorTS(fileExtension)) {
		return null;
	}

	const project = new Project({
		compilerOptions: {
			allowJs: true,
		},
	});

	return project.addSourceFileAtPathIfExists(filePath) ?? null;
};

const UrlParamKeys = {
	Engine: "engine" as const,
	DiffId: "diffId" as const,
	IV: "iv" as const,
	Command: "command" as const,
};

const createCodemodStudioURL = ({
	engine,
	diffId,
	iv,
}: {
	engine: KnownEngines;
	diffId: string;
	iv: string;
}): string | null => {
	try {
		const url = new URL("https://codemod.studio/");
		const searchParams = new URLSearchParams([
			[UrlParamKeys.Engine, engine],
			[UrlParamKeys.DiffId, diffId],
			[UrlParamKeys.IV, iv],
			[UrlParamKeys.Command, "learn"],
		]);

		url.search = searchParams.toString();

		return url.toString();
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const handleLearnCliCommand = async (
	printer: PrinterBlueprint,
	filePath: string | null,
) => {
	if (filePath !== null && !isFileInGitDirectory(filePath)) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"The file on which you tried to run operation is not in a git repository.",
		});
		return;
	}

	const path = filePath ?? (await findLastlyModifiedFile());

	if (path === null) {
		printer.printOperationMessage({
			kind: "error",
			message: "We could not find any modified file to run the command on.",
		});
		return;
	}

	const fileExtension = getFileExtension(path);

	if (!isJSorTS(fileExtension)) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"At this moment, we are supporting only Jscodeshift engine, so the file must be either a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx).\n" +
				"Soon, we will support other engines and hence other extensions including .md, .mdx and more!",
		});
		return;
	}

	const latestCommitHash = getLatestCommitHash(dirname(path));
	if (latestCommitHash === null) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"Unexpected error occurred while getting the latest commit hash.",
		});
		return;
	}

	const modifiedFiles = findModifiedFiles();
	if (modifiedFiles !== null && modifiedFiles.length > 1) {
		printer.printConsoleMessage(
			"warn",
			"Only the changes in the most recently edited file will be processed.",
		);
	}

	printer.printConsoleMessage(
		"info",
		chalk.cyan(
			"Learning ",
			chalk.bold(doubleQuotify("git diff")),
			" at ",
			chalk.bold(path),
			" has begun...",
			"\n",
		),
	);

	const gitDiff = getGitDiffForFile(latestCommitHash, path);
	if (gitDiff === null) {
		printer.printOperationMessage({
			kind: "error",
			message: "Unexpected error occurred while running `git diff` command.",
		});
		return;
	}

	if (gitDiff.length === 0) {
		printer.printOperationMessage({
			kind: "error",
			message:
				"There is no difference between the status of the file and that at the previous commit.",
		});
		return;
	}

	const oldSourceFile = getOldSourceFile(latestCommitHash, path, fileExtension);
	const sourceFile = getSourceFile(path, fileExtension);

	if (oldSourceFile === null || sourceFile === null) {
		printer.printOperationMessage({
			kind: "error",
			message: "Unexpected error occurred while getting AST of the file.",
		});
		return;
	}

	const beforeNodeTexts = new Set<string>();
	const afterNodeTexts = new Set<string>();

	const lines = gitDiff.split("\n");

	for (const line of lines) {
		if (!line.startsWith("-") && !line.startsWith("+")) {
			continue;
		}

		const codeString = line.substring(1).trim();
		if (removeSpecialCharacters(codeString).length === 0) {
			continue;
		}

		if (line.startsWith("-")) {
			oldSourceFile.forEachChild((node) => {
				const content = node.getFullText();

				if (content.includes(codeString) && !beforeNodeTexts.has(content)) {
					beforeNodeTexts.add(content);
				}
			});
		}

		if (line.startsWith("+")) {
			sourceFile.forEachChild((node) => {
				const content = node.getFullText();
				if (content.includes(codeString) && !afterNodeTexts.has(content)) {
					afterNodeTexts.add(content);
				}
			});
		}
	}

	const irrelevantNodeTexts = new Set<string>();

	beforeNodeTexts.forEach((text) => {
		if (afterNodeTexts.has(text)) {
			irrelevantNodeTexts.add(text);
		}
	});

	irrelevantNodeTexts.forEach((text) => {
		beforeNodeTexts.delete(text);
		afterNodeTexts.delete(text);
	});

	const beforeSnippet = Array.from(beforeNodeTexts)
		.join("")
		// remove all occurrences of `\n` at the beginning
		.replace(/^\n+/, "");
	const afterSnippet = Array.from(afterNodeTexts)
		.join("")
		// remove all occurrences of `\n` at the beginning
		.replace(/^\n+/, "");

	const { id: diffId, iv } = await createCodeDiff({
		beforeSnippet,
		afterSnippet,
	});
	const url = createCodemodStudioURL({
		// TODO: Support other engines in the future
		engine: "jscodeshift",
		diffId,
		iv,
	});

	if (url === null) {
		printer.printOperationMessage({
			kind: "error",
			message: "Unexpected error occurred while creating a URL.",
		});
		return;
	}

	printer.printConsoleMessage(
		"info",
		chalk.cyan("Learning went successful! Opening the Codemod Studio...\n"),
	);

	const success = openURL(url);
	if (!success) {
		printer.printOperationMessage({
			kind: "error",
			message: "Unexpected error occurred while opening the Codemod Studio.",
		});
		return;
	}
};
