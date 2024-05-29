import { exec } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execPromise = promisify(exec);

// Function to increment version in .codemodrc.json
const incrementCodemodrcVersion = async (filePath: string) => {
  try {
    const data = await readFile(filePath, "utf8");
    const config = JSON.parse(data);
    if (config.version) {
      const versionParts = config.version.split(".").map(Number);
      versionParts[versionParts.length - 1]++;
      config.version = versionParts.join(".");
    } else {
      config.version = "1.0.1"; // default initial version if not set
    }
    await writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
  } catch (error) {
    console.error(`Failed to update version in ${filePath}: ${error}`);
  }
};

// Function to modify README.md
const modifyReadme = async (filePath: string) => {
  let modified = false;
  try {
    const data = await readFile(filePath, "utf8");
    const lines = data.split("\n");
    const filteredLines = lines.filter(
      (line) => !(line.startsWith("# ") || line.startsWith("## Description")),
    );
    await writeFile(filePath, filteredLines.join("\n"), "utf8");
    modified = filteredLines.length !== lines.length;
  } catch (error) {
    console.error(`Failed to modify README in ${filePath}: ${error}`);
  }

  return modified;
};

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

    const codemodrcPath = join(dir, ".codemodrc.json");
    const readmePath = join(dir, "README.md");

    try {
      // Increment version in .codemodrc.json
      const modified = await modifyReadme(readmePath);

      if (modified) {
        await incrementCodemodrcVersion(codemodrcPath);
      }
    } catch (error) {
      console.error(error);
    }
  }
})();
