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

		let { stderr, stdout } = await execPromise(
			`codemod publish --source ${dir}`,
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
