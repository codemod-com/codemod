import fs from 'fs';
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'path';
import * as yaml from 'js-yaml';
import { PrinterBlueprint } from './printer.js';

export const runAstgrep = async (
	printer: PrinterBlueprint,
	rulePath: string,
	targetDirectory: string,
): Promise<void> => {
	const yamlString = await readFile(rulePath, { encoding: 'utf8' });
	const yamlObject = yaml.load(yamlString);
	const extension = languageToExtension(yamlObject.language);
	installSgCommandIfNotAvailable(printer);
	printer.printConsoleMessage(
		'info',
		`Executing ast-grep for language : ${extension}`,
	);

	// Function to recursively iterate over files in the directory
	const iterateFiles = async (dirPath: string) => {
		const entries = await fs.promises.readdir(dirPath, {
			withFileTypes: true,
		});

		// Iterate over each entry in the directory
		for (const entry of entries) {
			const entryPath = path.join(dirPath, entry.name);
			// Check if the entry is a directory
			if (entry.isDirectory()) {
				// Recursively call the function for subdirectories
				await iterateFiles(entryPath);
			} else if (entry.isFile()) {
				// If the entry is a file, log its path
				const fileExtension = path.extname(entryPath).slice(1);
				if (fileExtension !== extension) {
					continue;
				}
				const astCommand = `sg scan -r ${rulePath} ${entryPath} -U`;
				if (process.platform == 'win32') {
					execSync(`powershell -Command "${astCommand}"`);
				} else {
					execSync(astCommand);
				}
			}
		}
	};

	await iterateFiles(targetDirectory);
	return;
};

function languageToExtension(language: string) {
	language = language.toLocaleLowerCase();
	switch (language) {
		case 'python':
			return 'py';
		case 'javascript':
			return 'js';
		default:
			throw new Error(
				`Unsupported Language ${language} in codemod cli for ast-grep engine`,
			);
	}
}

// Function to check if ast-grep is available or not
const installSgCommandIfNotAvailable = (printer: PrinterBlueprint): void => {
	try {
		// Use `which` command to check if the command is available
		execSync(`which sg`);
	} catch (error) {
		// If `which` command fails, the command is not available
		printer.printConsoleMessage(
			'info',
			'ast-grep is not avialable, installing it globally',
		);
		const astInstallCommand = `npm install -g @ast-grep/cli`;
		if (process.platform == 'win32') {
			execSync(`powershell -Command "${astInstallCommand}"`);
		} else {
			execSync(astInstallCommand);
		}
	}
};
