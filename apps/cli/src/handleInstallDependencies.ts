import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import {
	CodemodConfig,
	extractLibNameAndVersion,
} from "@codemod-com/utilities";
import { glob } from "fast-glob";
import inquirer from "inquirer";
import { PrinterBlueprint } from "./printer";
import { boldText, colorizeText } from "./utils";

const execPromise = promisify(exec);
type PackageManager = "yarn" | "npm" | "pnpm" | "bun";

const lockFilesToPmMap: Record<string, PackageManager> = {
	"package-lock.json": "npm",
	"yarn.lock": "yarn",
	"pnpm-lock.yaml": "pnpm",
	"bun.lockb": "bun",
};

type InstallationChoice = "root" | "affected" | "none";
const INSTALL_INQUIRER_CHOICES: { name: string; value: InstallationChoice }[] =
	[
		{
			name: "Modify dependencies in the affected package.jsons",
			value: "affected",
		},
		{
			name: "Modify dependencies in the root package.json",
			value: "root",
		},
		{
			name: "Skip dependency installation",
			value: "none",
		},
	];

type InstallationChoiceShort = "root" | "none";
const INSTALL_INQUIRER_CHOICES_SHORT: {
	name: string;
	value: InstallationChoice;
}[] = [
	{
		name: "Install dependencies",
		value: "root",
	},
	{
		name: "Skip dependency installation",
		value: "none",
	},
];

export const handleInstallDependencies = async (options: {
	printer: PrinterBlueprint;
	target: string;
	deps: NonNullable<CodemodConfig["deps"]>;
	affectedFiles: string[];
}) => {
	const { printer, target, affectedFiles, deps } = options;

	try {
		if (deps.length === 0) {
			return;
		}

		let detectedPackageManager: PackageManager | null = null;

		let rootPath: string | null = null;
		try {
			const { stdout } = await execPromise("git rev-parse --show-toplevel", {
				cwd: target,
			});
			const output = stdout.trim();
			if (output.length) {
				rootPath = output;
			}
		} catch (error) {
			//
		}

		// did not find root using git CLI. we can try to find it using .git directory
		if (rootPath === null) {
			let currentDir = target;

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

		// do lockfiles lookup and determine package manager, set rootPath if it's still null
		let currentDir = target;

		while (true) {
			for (const lockFile of Object.keys(lockFilesToPmMap)) {
				if (existsSync(join(currentDir, lockFile))) {
					detectedPackageManager = lockFilesToPmMap[lockFile]!;
					if (rootPath === null) {
						rootPath = currentDir;
					}
					break;
				}
			}

			if (rootPath) break;

			const parentDir = dirname(currentDir);
			if (parentDir === currentDir) break; // Reached the filesystem root
			currentDir = parentDir;
		}

		// if rootPath is still null, set it to target
		if (rootPath === null) {
			printer.printConsoleMessage(
				"info",
				`Could not determine the root of the project programmatically, defaulting to ${target}...`,
			);
			rootPath = target;
		}

		// if couldn't determine package manager, try to check for packageManager field in package.jsons
		const packageJsons = await glob("**/package.json", {
			cwd: rootPath,
			ignore: ["**/node_modules/**"],
			absolute: true,
		});

		if (detectedPackageManager === null) {
			for (const packageJsonPath of packageJsons) {
				const packageJson = await import(packageJsonPath);
				if (packageJson.packageManager) {
					detectedPackageManager = packageJson.packageManager.split("@").at(0);
					break;
				}
			}
		}

		// if still no pm, default to npm
		if (detectedPackageManager === null) {
			detectedPackageManager = "npm";
		}

		// Determine package.json files that were affected by the codemod run
		const affectedProjectsPackageJsons = packageJsons.filter((p) =>
			affectedFiles.some((f) => f.startsWith(dirname(p))),
		);

		const toInstall: string[] = [];
		const toDelete: string[] = [];
		for (const dep of deps) {
			const { libName, version } = extractLibNameAndVersion(dep);

			if (libName?.startsWith("-")) {
				toDelete.push(libName.slice(1));
			} else {
				toInstall.push(dep);
			}
		}

		// Here, we tell the user that we removed the deps from affected jsons and we give them a choice:
		// 1. Install dependencies in the package.jsons of the projects that were affected by the codemod run
		// 2. Install dependencies in the root package.json
		// 3. Do nothing if we were wrong to detect the correct package.jsons
		// Options 1 and 2 become just "Install dependencies" if root package json is the only one that is in the affected list
		const rootPackageJsonPath = join(rootPath, "package.json");

		const installedDepsString = colorizeText(
			`+ ${toInstall.join("\n+ ")}`,
			"green",
		);
		const unInstalledDepsString = colorizeText(
			`- ${toDelete.join("\n- ")}`,
			"red",
		);
		const affectedString = boldText(
			affectedProjectsPackageJsons.map((p) => relative(target, p)).join("\n"),
		);

		let installationType: InstallationChoice = "none";
		if (affectedProjectsPackageJsons.length > 0) {
			printer.printConsoleMessage(
				"info",
				colorizeText(`\nAffected package.jsons:\n${affectedString}`, "cyan"),
			);

			printer.printConsoleMessage(
				"info",
				colorizeText(
					`\nDetected package manager: ${boldText(detectedPackageManager)}`,
					"cyan",
				),
			);

			printer.printConsoleMessage(
				"info",
				`\n${colorizeText(
					"This codemod expects the following dependency changes:",
					"cyan",
				)}\n${installedDepsString}\n${unInstalledDepsString}\n`,
			);

			if (
				existsSync(rootPackageJsonPath) &&
				affectedProjectsPackageJsons.length > 1
			) {
				const answers = await inquirer.prompt<{
					install: InstallationChoiceShort;
				}>({
					type: "list",
					name: "install",
					message:
						"A root package.json was detected in your project. Select how you want to proceed:",
					default: "root",
					pageSize: INSTALL_INQUIRER_CHOICES_SHORT.length,
					choices: INSTALL_INQUIRER_CHOICES_SHORT,
				});
				installationType = answers.install;
			} else {
				const answers = await inquirer.prompt<{ install: InstallationChoice }>({
					type: "list",
					name: "install",
					message:
						"Do you want to make the dependency changes in the affected package.jsons?",
					default: "affected",
					pageSize: INSTALL_INQUIRER_CHOICES.length,
					choices: INSTALL_INQUIRER_CHOICES,
				});
				installationType = answers.install;
			}

			const PM_INQUIRER_CHOICES: { name: string; value: PackageManager }[] = [
				{
					name: detectedPackageManager,
					value: detectedPackageManager,
				},
				...Object.values(lockFilesToPmMap)
					.filter((pm) => pm !== detectedPackageManager)
					.map((pm) => ({
						name: pm,
						value: pm,
					})),
			];

			const answers = await inquirer.prompt<{ pm: PackageManager }>({
				type: "list",
				name: "pm",
				message: "Do you want to override the detected package manager?",
				default: detectedPackageManager,
				pageSize: PM_INQUIRER_CHOICES.length,
				choices: PM_INQUIRER_CHOICES,
			});

			detectedPackageManager = answers.pm;
		}

		if (installationType === "none") {
			return;
		}

		printer.printConsoleMessage(
			"info",
			colorizeText(
				`Using package manager: ${boldText(detectedPackageManager)}`,
				"cyan",
			),
		);

		const removeCmd = detectedPackageManager === "npm" ? "uninstall" : "remove";
		const addCmd = detectedPackageManager === "npm" ? "install" : "add";

		if (installationType === "root") {
			printer.printConsoleMessage(
				"info",
				`Removing: ${toDelete.join(", ")}...`,
			);
			await execPromise(
				`${detectedPackageManager} ${removeCmd} ${toDelete.join(" ")}`,
				{ cwd: rootPath },
			);

			printer.printConsoleMessage(
				"info",
				`Installing: ${toInstall.join(", ")}...`,
			);
			await execPromise(
				`${detectedPackageManager} ${addCmd} ${toInstall.join(" ")}`,
				{
					cwd: rootPath,
				},
			);
		} else {
			printer.printConsoleMessage(
				"info",
				`Removing: ${toDelete.join(", ")}...`,
			);
			for (const packageJsonPath of affectedProjectsPackageJsons) {
				const packageJson = await import(packageJsonPath);
				if (
					!toDelete.some(
						(dep) =>
							dep in packageJson.dependencies ||
							dep in packageJson.devDependencies,
					)
				) {
					continue;
				}

				await execPromise(
					`${detectedPackageManager} ${removeCmd} ${toDelete.join(" ")}`,
					{ cwd: dirname(packageJsonPath) },
				);
			}

			printer.printConsoleMessage(
				"info",
				`Installing: ${toInstall.join(", ")}...`,
			);
			for (const packageJsonPath of affectedProjectsPackageJsons) {
				await execPromise(
					`${detectedPackageManager} ${addCmd} ${toInstall.join(" ")}`,
					{ cwd: dirname(packageJsonPath) },
				);
			}
		}

		printer.printConsoleMessage(
			"info",
			`Successfully installed dependencies: \n${installedDepsString}\n\n${unInstalledDepsString}\n\nin:\n${affectedString}`,
		);
	} catch (error) {
		if (!(error instanceof Error)) {
			return;
		}

		printer.printConsoleMessage(
			"error",
			`Failed to install dependencies:\n${error.message}`,
		);
	}
};
