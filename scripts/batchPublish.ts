import { exec } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

// This script requires commenting out questions about namespaces, git url and tags because
// we not ask them unconditionally.

const execPromise = promisify(exec);

// Function to recursively walk through directory tree
const walkDirectory = async (dir: string, accumulator: string[]) => {
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

const oraCheckmark = "✔";

// Main function to execute the script
(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Error: Please provide the target path as an argument.");
    process.exit(1);
  }

  const targetPath = args[0];
  const accumulator: string[] = [];

  await walkDirectory(targetPath, accumulator);

  for (let i = 0; i < accumulator.length; i++) {
    const dir = accumulator[i].replace(/(\s+)/g, "\\$1");

    console.log(`Publishing ${dir}`);

    const { stderr, stdout } = await execPromise(
      `apps/cli/dist/index.cjs publish --source ${dir}`,
    );

    const output = stdout.trim();
    const errors = stderr.trim();

    if (
      !output.includes("Codemod was successfully published to the registry")
    ) {
      console.error(`Failed to publish ${dir}`);
      console.error(errors);
      break;
    }

    console.log("OUTPUT:", output);
    console.log("ERRORS: ", errors);
    console.log(`\nSuccessfully published ${dir}?`);
    console.log(`Published ${i + 1} of ${accumulator.length} directories`);
    console.log("=====================================\n");
  }
})();
