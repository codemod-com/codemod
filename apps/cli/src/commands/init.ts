import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import {
	type KnownEngines,
	type ProjectDownloadInput,
	doubleQuotify,
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

export let handleInitCliCommand = async (
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

	let files = getCodemodProjectFiles(downloadInput);

	let codemodBaseDir = join(process.cwd(), downloadInput.name);

	let created: string[] = [];
	for (let [path, content] of Object.entries(files)) {
		let filePath = join(codemodBaseDir, path);

		try {
			await mkdir(dirname(filePath), { recursive: true });
			await writeFile(filePath, content);
			created.push(path);
		} catch (err) {
			printer.printConsoleMessage(
				'error',
				chalk.red(
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
	printer.printConsoleMessage('info', chalk.cyan(howToRunText, 'cyan'));

	let publishText = `Run ${chalk.bold(
		doubleQuotify('codemod publish'),
	)} to publish the codemod to the Codemod registry.`;
	if (isJsCodemod) {
		publishText += chalk.yellow(
			'NOTE: Your codemod has to be built using the build command',
		);
	}
	printer.printConsoleMessage('info', chalk.cyan(publishText));

	let otherGuidelinesText = `For other guidelines, please visit our documentation at ${terminalLink(
		chalk.bold('https://docs.codemod.com'),
		'https://docs.codemod.com',
	)} or type ${chalk.bold(doubleQuotify('codemod --help'))}.`;
	printer.printConsoleMessage('info', chalk.cyan(otherGuidelinesText));
};
