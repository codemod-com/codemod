import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import {
	CodemodConfig,
	isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import { glob } from "fast-glob";
import { PrinterBlueprint } from "./printer";
import { colorizeText } from "./utils";

const execPromise = promisify(exec);
type PackageManager = "yarn" | "npm" | "pnpm" | "bun";

const lockFilesToPmMap: Record<string, PackageManager> = {
	"package-lock.json": "npm",
	"yarn.lock": "yarn",
	"pnpm-lock.yaml": "pnpm",
	"bun.lock": "bun",
};

export const handleInstallDependencies = async (options: {
	printer: PrinterBlueprint;
	source: string;
	deps: NonNullable<CodemodConfig["deps"]>;
}) => {
	const { printer, source, deps } = options;

	if (deps.length === 0) {
		return;
	}

	let packageManager: PackageManager | null = null;

	let rootPath: string | null = null;
	try {
		const { stdout } = await execPromise("git rev-parse --show-toplevel", {
			cwd: source,
		});
		rootPath = stdout.trim();
	} catch (error) {
		//
	}

	// did not find root using git CLI. we can try to find it using .git directory
	if (!rootPath) {
		let currentDir = source;

		while (true) {
			if (existsSync(join(currentDir, ".git"))) {
				const packageJsonPath = join(currentDir, "package.json");
				if (existsSync(packageJsonPath)) {
					rootPath = currentDir;
				}
			}

			if (rootPath) break;

			const parentDir = dirname(currentDir);
			if (parentDir === currentDir) break; // Reached the filesystem root
			currentDir = parentDir;
		}
	}

	// did not find root using .git directory. we can try to find it using lockfiles
	if (!rootPath) {
		let currentDir = source;

		while (true) {
			for (const lockFile of Object.keys(lockFilesToPmMap)) {
				if (existsSync(join(currentDir, lockFile))) {
					packageManager = lockFilesToPmMap[lockFile]!;
					rootPath = currentDir;
					break;
				}
			}

			if (rootPath) break;

			const parentDir = dirname(currentDir);
			if (parentDir === currentDir) break; // Reached the filesystem root
			currentDir = parentDir;
		}
	}

	if (!rootPath) {
		printer.printConsoleMessage(
			"error",
			"Could not determine root path for the project. Please make sure you are running the codemod from within the project directory that is either a git repository, or has a lockfile.",
		);
		return;
	}

	// determine package manager based on lockfile if we found root path without using lockfile method
	if (!packageManager) {
		for (const lockFile of Object.keys(lockFilesToPmMap)) {
			if (existsSync(join(rootPath, lockFile))) {
				packageManager = lockFilesToPmMap[lockFile]!;
				break;
			}
		}
	}

	// if couldn't determine package manager, try to check for packageManager field in package.json
	if (!packageManager) {
		const packageJsonPath = join(rootPath, "package.json");
		const packageJson = await import(packageJsonPath);
		if (packageJson.packageManager) {
			packageManager = packageJson.packageManager.split("@").at(0);
		}
	}

	// if still no pm, default to npm
	if (!packageManager) {
		packageManager = "npm";
	}

	printer.printConsoleMessage(
		"info",
		`Using package manager: ${packageManager}`,
	);

	const toInstall: string[] = [];
	const toDelete: string[] = [];
	for (const dep of deps) {
		const [name, version] = dep.split("@");
		if (name?.startsWith("-")) {
			toDelete.push(name.slice(1));
		} else {
			toInstall.push(dep);
		}
	}

	const packageJsons = await glob("**/package.json", {
		cwd: rootPath,
		absolute: true,
	});

	const modifiedPackageJsons: string[] = [];

	printer.printConsoleMessage("info", `Removing: ${toDelete.join(", ")}...`);

	const removeCmd = packageManager === "npm" ? "uninstall" : "remove";
	for (const packageJsonPath of packageJsons) {
		const packageJson = await import(packageJsonPath);
		if (
			toDelete.some((dep) =>
				isNeitherNullNorUndefined(packageJson.dependencies?.[dep]),
			)
		) {
			modifiedPackageJsons.push(packageJsonPath);
		}

		await execPromise(`${packageManager} ${removeCmd} ${toDelete.join(" ")}`, {
			cwd: dirname(packageJsonPath),
		});
	}

	printer.printConsoleMessage("info", `Installing: ${toInstall.join(", ")}...`);

	const addCmd = packageManager === "npm" ? "install" : "add";
	for (const packageJsonPath of modifiedPackageJsons) {
		await execPromise(`${packageManager} ${addCmd} ${toInstall.join(" ")}`, {
			cwd: dirname(packageJsonPath),
		});
	}

	const installedDepsString = colorizeText(
		`+ ${toInstall.join("\n+ ")}`,
		"green",
	);
	const unInstalledDepsString = colorizeText(
		`- ${toDelete.join("\n- ")}`,
		"red",
	);
	const modifiedPackageJsonsString = modifiedPackageJsons
		.map((p) => relative(process.cwd(), p))
		.join("\n");
	printer.printConsoleMessage(
		"info",
		`Successfully installed dependencies: \n${installedDepsString}\n\n${unInstalledDepsString}\n\nin:\n${modifiedPackageJsonsString}`,
	);
};
