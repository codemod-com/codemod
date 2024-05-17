import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import {
	type KnownEngines,
	type ProjectDownloadInput,
	doubleQuotify,
	execPromise,
	getCodemodProjectFiles,
} from '@codemod-com/utilities';
import inquirer from 'inquirer';
import terminalLink from 'terminal-link';
import { getCurrentUserData } from '../utils.js';

let CODEMOD_ENGINE_CHOICES: KnownEngines[] = [
	'jscodeshift',
	'ts-morph',
	'filemod',
	'ast-grep',
];

type License = 'MIT' | 'Apache 2.0';
let LICENSE_CHOICES: License[] = ['MIT', 'Apache 2.0'];

export let handleInitCliCommand = async (options: {
	printer: PrinterBlueprint;
	target: string;
	noPrompt?: boolean;
	// assumed to be relative to target
	mainFilePath?: string;
}) => {
	let { printer, noPrompt = false, target, mainFilePath } = options;

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
		path?: string;
	} | null = null;

	// We provide main file path when user attempts to publish a non-compatible codemod package.
	// This is the only way we get inside of this conditional
	if (mainFilePath) {
		let defaultedAnswers = {
			typescript: extname(mainFilePath) === '.ts',
			git: false,
			npm: false,
		};

		let askedAnswers = await inquirer.prompt<{
			name: string;
			engine: KnownEngines;
			license: License;
			path: string;
		}>([
			{
				type: 'input',
				name: 'name',
				message: 'Please provide a name for your codemod:',
			},
			{
				type: 'list',
				name: 'engine',
				message: 'What engine was used to build your codemod?',
				pageSize: CODEMOD_ENGINE_CHOICES.length,
				choices: CODEMOD_ENGINE_CHOICES,
			},
			{
				type: 'list',
				name: 'license',
				message:
					'What kind of license do you want to include with your codemod?',
				pageSize: LICENSE_CHOICES.length,
				choices: LICENSE_CHOICES,
			},
			{
				type: 'input',
				name: 'path',
				message: 'Confirm path where you want to initiate a package',
				default: target,
			},
			// TODO:
			// {
			// 	type: "list",
			// 	name: "tags",
			// 	message: "Optionally select tags for your codemod:",
			// 	pageSize: TAGS_CHOICES.length,
			// 	choices: TAGS_CHOICES,
			// },
		]);

		answers = {
			...defaultedAnswers,
			...askedAnswers,
		};
	} else if (!noPrompt) {
		answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Provide a name for your codemod:',
			},
			{
				type: 'list',
				name: 'engine',
				message:
					'Select a codemod engine you want to build your codemod with:',
				pageSize: CODEMOD_ENGINE_CHOICES.length,
				choices: CODEMOD_ENGINE_CHOICES,
			},
			{
				type: 'list',
				name: 'license',
				message:
					'Select a license you want to include with your codemod:',
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
				type: 'confirm',
				name: 'typescript',
				message: 'Do you want to use TypeScript?',
				default: true,
			},
			{
				type: 'confirm',
				name: 'git',
				message: 'Do you want to initialize an empty git repository?',
				default: false,
			},
			{
				type: 'confirm',
				name: 'npm',
				message: 'Do you want to install npm dependencies?',
				default: false,
			},
		]);
	}

	let userData = await getCurrentUserData();

	let downloadInput: ProjectDownloadInput = answers
		? {
				engine: answers.engine,
				name: answers.name,
				license: answers.license,
				username: userData?.user.username ?? null,
				vanillaJs: !answers.typescript,
				// TODO:
				// tags
			}
		: {
				engine: 'jscodeshift',
				name: 'my-awesome-codemod',
				license: 'MIT',
				username: userData?.user.username ?? null,
				// TODO:
				// tags
			};

	if (mainFilePath) {
		try {
			downloadInput.codemodBody = await readFile(
				resolve(target, mainFilePath),
				'utf-8',
			);
		} catch (err) {
			printer.printConsoleMessage(
				'error',
				chalk(
					'Failed to read provided main file at',
					`${chalk.bold(mainFilePath)}:`,
					`${(err as Error).message}.`,
					'Aborting codemod creation...',
				),
			);
		}
	}

	let files = getCodemodProjectFiles(downloadInput);

	let codemodBaseDir =
		answers?.path ?? join(process.cwd(), downloadInput.name);

	let created: string[] = [];
	for (let [path, content] of Object.entries(files)) {
		let filePath = join(codemodBaseDir, path);

		try {
			await mkdir(dirname(filePath), { recursive: true });
			if (!existsSync(filePath)) {
				await writeFile(filePath, content);
				created.push(path);
			}
		} catch (err) {
			printer.printConsoleMessage(
				'error',
				chalk(
					'Failed to write file',
					`${chalk.bold(path)}:`,
					`${(err as Error).message}.`,
					'Aborting codemod creation...',
				),
			);

			for (let createdPath of created) {
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
		'info',
		chalk.cyan(
			'Codemod package created at',
			`${chalk.bold(codemodBaseDir)}.`,
		),
	);

	if (answers?.git) {
		try {
			await execPromise('git init', { cwd: codemodBaseDir });
		} catch (err) {
			printer.printConsoleMessage(
				'error',
				`Failed to initialize git repository:\n${(err as Error).message}.`,
			);
		}
	}

	if (answers?.npm) {
		try {
			await execPromise('pnpm i', { cwd: codemodBaseDir });
		} catch (err) {
			try {
				await execPromise('npm i', { cwd: codemodBaseDir });
			} catch (err) {
				printer.printConsoleMessage(
					'error',
					`Failed to install npm dependencies:\n${(err as Error).message}.`,
				);
			}
		}
	}

	if (mainFilePath) {
		return codemodBaseDir;
	}

	let isJsCodemod =
		answers?.engine === 'jscodeshift' ||
		answers?.engine === 'ts-morph' ||
		answers?.engine === 'filemod' ||
		answers === null;
	if (isJsCodemod) {
		printer.printConsoleMessage(
			'info',
			chalk.cyan(
				'\nRun',
				chalk.bold(doubleQuotify('codemod build')),
				'to build the codemod.',
			),
		);
	}

	let howToRunText = `Run ${chalk.bold(
		doubleQuotify(`codemod --source ${codemodBaseDir}`),
	)} to run the codemod on current working directory (or specify a target using ${chalk.yellow(
		'--target',
	)} option).`;
	printer.printConsoleMessage('info', chalk.cyan(howToRunText));

	let publishText = `Run ${chalk.bold(
		doubleQuotify('codemod publish'),
	)} to publish the codemod to the Codemod registry.`;
	if (isJsCodemod) {
		publishText += chalk.yellow(
			' NOTE: Your codemod has to be built using the build command',
		);
	}
	printer.printConsoleMessage('info', chalk.cyan(publishText));

	let otherGuidelinesText = `For other guidelines, please visit our documentation at ${terminalLink(
		chalk.bold('https://docs.codemod.com'),
		'https://docs.codemod.com',
	)} or type ${chalk.bold(doubleQuotify('codemod --help'))}.`;
	printer.printConsoleMessage('info', chalk.cyan(otherGuidelinesText));

	return codemodBaseDir;
};
