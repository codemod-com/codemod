import { exec } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

let execPromise = promisify(exec);

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

// Publish
(async () => {
	let accumulator: string[] = [];
	await walkDirectory('../packages/codemods', accumulator);

	for (let i = 0; i < accumulator.length; i++) {
		let dir = accumulator[i].replace(/(\s+)/g, '\\$1');

		let { stderr, stdout } = await execPromise(
			`./apps/cli/dist/index.cjs publish --source ${dir}`,
		);

		let output = stdout.trim();
		if (output.length) {
			console.log(output);
		}

		let errors = stderr.trim();
		if (!errors.length) {
			console.log(`Successfully published ${dir}`);
			console.log(
				`Published ${i + 1} of ${accumulator.length} directories`,
			);
			console.log('=====================================');
			continue;
		}

		console.error(`Failed to publish ${dir}`);
		console.error(errors);
	}
})();
