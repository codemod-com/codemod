import { execSync } from 'node:child_process';
import { dirname, extname } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import { type KnownEngines, doubleQuotify } from '@codemod-com/utilities';
import { Project } from 'ts-morph';
import { createCodeDiff } from '../apis.js';
import {
	findLastlyModifiedFile,
	findModifiedFiles,
	getGitDiffForFile,
	getLatestCommitHash,
	isFileInGitDirectory,
} from '../gitCommands.js';
import { openURL } from '../utils.js';

// remove all special characters and whitespaces
let removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, '').replace(/\s/g, '');

let isJSorTS = (name: string) =>
	name.startsWith('.ts') || name.startsWith('.js');

let getFileExtension = (filePath: string) => {
	return extname(filePath).toLowerCase();
};

let getOldSourceFile = (
	commitHash: string,
	filePath: string,
	fileExtension: string,
) => {
	if (!isJSorTS(fileExtension)) {
		return null;
	}

	try {
		let commitWithFileName = doubleQuotify(`${commitHash}:${filePath}`);
		let output = execSync(`git show ${commitWithFileName}`).toString();

		let project = new Project({
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

let getSourceFile = (filePath: string, fileExtension: string) => {
	if (!isJSorTS(fileExtension)) {
		return null;
	}

	let project = new Project({
		compilerOptions: {
			allowJs: true,
		},
	});

	return project.addSourceFileAtPathIfExists(filePath) ?? null;
};

let UrlParamKeys = {
	Engine: 'engine' as const,
	DiffId: 'diffId' as const,
	IV: 'iv' as const,
	Command: 'command' as const,
};

let createCodemodStudioURL = ({
	engine,
	diffId,
	iv,
}: {
	engine: KnownEngines;
	diffId: string;
	iv: string;
}): string | null => {
	try {
		let url = new URL(process.env.CODEMOD_STUDIO_URL);
		let searchParams = new URLSearchParams([
			[UrlParamKeys.Engine, engine],
			[UrlParamKeys.DiffId, diffId],
			[UrlParamKeys.IV, iv],
			[UrlParamKeys.Command, 'learn'],
		]);

		url.search = searchParams.toString();

		return url.toString();
	} catch (error) {
		console.error(error);
		return null;
	}
};

export let handleLearnCliCommand = async (options: {
	printer: PrinterBlueprint;
	target: string | null;
}) => {
	let { printer, target } = options;

	if (target !== null && !isFileInGitDirectory(target)) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'The file on which you tried to run operation is not in a git repository.',
		});
		return;
	}

	let dirtyPath = target ?? (await findLastlyModifiedFile());

	if (dirtyPath === null) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'We could not find any modified file to run the command on.',
		});
		return;
	}

	let path = dirtyPath.replace(/\$/g, '\\$').replace(/\^/g, '\\^');

	let fileExtension = getFileExtension(path);

	if (!isJSorTS(fileExtension)) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'At this moment, we are supporting only Jscodeshift engine, so the file must be either a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx).\n' +
				'Soon, we will support other engines and hence other extensions including .md, .mdx and more!',
		});
		return;
	}

	let latestCommitHash = getLatestCommitHash(dirname(path));
	if (latestCommitHash === null) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'Unexpected error occurred while getting the latest commit hash.',
		});
		return;
	}

	let modifiedFiles = findModifiedFiles();
	if (modifiedFiles !== null && modifiedFiles.length > 1) {
		printer.printConsoleMessage(
			'warn',
			'Only the changes in the most recently edited file will be processed.',
		);
	}

	printer.printConsoleMessage(
		'info',
		chalk.cyan(
			'Learning',
			chalk.bold(doubleQuotify('git diff')),
			'at',
			chalk.bold(path),
			'has begun...',
			'\n',
		),
	);

	let gitDiff = getGitDiffForFile(latestCommitHash, path);
	if (gitDiff === null) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'Unexpected error occurred while running `git diff` command.',
		});
		return;
	}

	if (gitDiff.length === 0) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'There is no difference between the status of the file and that at the previous commit.',
		});
		return;
	}

	let oldSourceFile = getOldSourceFile(latestCommitHash, path, fileExtension);
	let sourceFile = getSourceFile(dirtyPath, fileExtension);

	if (oldSourceFile === null || sourceFile === null) {
		printer.printOperationMessage({
			kind: 'error',
			message: 'Unexpected error occurred while getting AST of the file.',
		});
		return;
	}

	let beforeNodeTexts = new Set<string>();
	let afterNodeTexts = new Set<string>();

	let lines = gitDiff.split('\n');

	for (let line of lines) {
		if (!line.startsWith('-') && !line.startsWith('+')) {
			continue;
		}

		let codeString = line.substring(1).trim();
		if (removeSpecialCharacters(codeString).length === 0) {
			continue;
		}

		if (line.startsWith('-')) {
			oldSourceFile.forEachChild((node) => {
				let content = node.getFullText();

				if (
					content.includes(codeString) &&
					!beforeNodeTexts.has(content)
				) {
					beforeNodeTexts.add(content);
				}
			});
		}

		if (line.startsWith('+')) {
			sourceFile.forEachChild((node) => {
				let content = node.getFullText();
				if (
					content.includes(codeString) &&
					!afterNodeTexts.has(content)
				) {
					afterNodeTexts.add(content);
				}
			});
		}
	}

	let irrelevantNodeTexts = new Set<string>();

	beforeNodeTexts.forEach((text) => {
		if (afterNodeTexts.has(text)) {
			irrelevantNodeTexts.add(text);
		}
	});

	irrelevantNodeTexts.forEach((text) => {
		beforeNodeTexts.delete(text);
		afterNodeTexts.delete(text);
	});

	let beforeSnippet = Array.from(beforeNodeTexts)
		.join('')
		// remove all occurrences of `\n` at the beginning
		.replace(/^\n+/, '');
	let afterSnippet = Array.from(afterNodeTexts)
		.join('')
		// remove all occurrences of `\n` at the beginning
		.replace(/^\n+/, '');

	let { id: diffId, iv } = await createCodeDiff({
		beforeSnippet,
		afterSnippet,
	});
	let url = createCodemodStudioURL({
		// TODO: Support other engines in the future
		engine: 'jscodeshift',
		diffId,
		iv,
	});

	if (url === null) {
		printer.printOperationMessage({
			kind: 'error',
			message: 'Unexpected error occurred while creating a URL.',
		});
		return;
	}

	printer.printConsoleMessage(
		'info',
		chalk.cyan('Learning went successful! Opening the Codemod Studio...\n'),
	);

	let success = openURL(url);
	if (!success) {
		printer.printOperationMessage({
			kind: 'error',
			message:
				'Unexpected error occurred while opening the Codemod Studio.',
		});
		return;
	}
};
