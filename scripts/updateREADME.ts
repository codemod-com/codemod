import { exec } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

let execPromise = promisify(exec);

// Function to increment version in .codemodrc.json
let incrementCodemodrcVersion = async (filePath: string) => {
	try {
		let data = await readFile(filePath, 'utf8');
		let config = JSON.parse(data);
		if (config.version) {
			let versionParts = config.version.split('.').map(Number);
			versionParts[versionParts.length - 1]++;
			config.version = versionParts.join('.');
		} else {
			config.version = '1.0.1'; // default initial version if not set
		}
		await writeFile(filePath, JSON.stringify(config, null, 2), 'utf8');
	} catch (error) {
		console.error(`Failed to update version in ${filePath}: ${error}`);
	}
};

// Function to modify README.md
let modifyReadme = async (filePath: string) => {
	let modified = false;
	try {
		let data = await readFile(filePath, 'utf8');
		let lines = data.split('\n');
		let filteredLines = lines.filter(
			(line) =>
				!(line.startsWith('# ') || line.startsWith('## Description')),
		);
		await writeFile(filePath, filteredLines.join('\n'), 'utf8');
		modified = filteredLines.length !== lines.length;
	} catch (error) {
		console.error(`Failed to modify README in ${filePath}: ${error}`);
	}

	return modified;
};

// Function to recursively walk through directory tree
let walkDirectory = async (dir: string, accumulator: string[]) => {
	// Read directory contents
	let entries = await readdir(dir, { withFileTypes: true });
	for (let entry of entries) {
		let fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			// Recursively walk into directories
			await walkDirectory(fullPath, accumulator);
		} else if (entry.name === '.codemodrc.json') {
			// If the entry is a .codemodrc.json file, accumulate the directory path
			accumulator.push(dir);
		}
	}
};

// Main function to execute the script
(async () => {
	let args = process.argv.slice(2);
	if (args.length === 0) {
		console.error('Error: Please provide the target path as an argument.');
		process.exit(1);
	}

	let targetPath = args[0];
	let accumulator: string[] = [];

	await walkDirectory(targetPath, accumulator);

	for (let i = 0; i < accumulator.length; i++) {
		let dir = accumulator[i].replace(/(\s+)/g, '\\$1');

		let codemodrcPath = join(dir, '.codemodrc.json');
		let readmePath = join(dir, 'README.md');

		try {
			// Increment version in .codemodrc.json
			let modified = await modifyReadme(readmePath);

			if (modified) {
				await incrementCodemodrcVersion(codemodrcPath);
			}
		} catch (error) {
			console.error(error);
		}
	}
})();
