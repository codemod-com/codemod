import { exec } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { readdir } from "fs/promises";

const execPromise = promisify(exec);

// Function to recursively walk through directory tree
const walkDirectory = async (dir, accumulator) => {
	// Read directory contents
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			// Recursively walk into directories
			await walkDirectory(fullPath, accumulator);
		} else if (entry.name === ".codemodrc.json") {
			// If the entry is a .codemodrc.json file, accumulate the directory path
			accumulator.push(dir);
		}
	}
};

(async () => {
	const accumulator = [];
	await walkDirectory("./packages/codemods", accumulator);

	// await execPromise(
	// 	`./apps/cli/dist/index.cjs publish --source ${accumulator[0]}`,
	// );
	for (const dir of accumulator) {
		// Run publish on the directory
		const { stderr, stdout } = await execPromise(
			`./apps/cli/dist/index.cjs publish --source ${dir}`,
		);

		const output = stdout.trim();
		if (output.length) {
			console.log(output);
		}

		const errors = stderr.trim();
		if (!errors.length) {
			console.log(`Successfully published ${dir}`);
			continue;
		}

		console.error(`Failed to publish ${dir}`);
		console.error(errors);
	}
})();
