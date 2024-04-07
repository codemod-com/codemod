import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import {
	CodemodConfig,
	extractLibNameAndVersion,
} from "@codemod-com/utilities";
import { glob } from "fast-glob";
import inquirer from "inquirer";
import { PrinterBlueprint } from "./printer";
import { boldText, colorizeText, execPromise } from "./utils";

type PackageManager = "yarn" | "npm" | "pnpm" | "bun";

const lockFilesToPmMap: Record<string, PackageManager> = {
	"package-lock.json": "npm",
	"yarn.lock": "yarn",
	"pnpm-lock.yaml": "pnpm",
	"bun.lockb": "bun",
};

type InstallationChoice = "root" | "affected" | "none";

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
				const packageJsonContent = await readFile(packageJsonPath, {
					encoding: "utf-8",
				});
				const packageJson = JSON.parse(packageJsonContent);

				if (packageJson.packageManager) {
					detectedPackageManager = packageJson.packageManager.split("@").at(0);
					break;
				}
			}
		}

		let defaultedToNpm = false;
		// if still no pm, default to npm
		if (detectedPackageManager === null) {
			defaultedToNpm = true;
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

		const installedDepsString = toInstall.length
			? colorizeText(`+ ${toInstall.join("\n+ ")}`, "green")
			: "";
		const unInstalledDepsString = toDelete.length
			? colorizeText(`- ${toDelete.join("\n- ")}`, "red")
			: "";
		const affectedString = boldText(
			affectedProjectsPackageJsons
				.map((p) => {
					const relativePath = relative(target, p);

					if (p === rootPackageJsonPath) {
						return `${colorizeText("ROOT:", "orange")} ${relativePath}`;
					}

					return relativePath;
				})
				.join("\n"),
		);

		if (affectedProjectsPackageJsons.length === 0) {
			return;
		}

		const INSTALL_INQUIRER_CHOICES: {
			name: string;
			value: InstallationChoice;
		}[] = [
			{
				name: "Modify dependencies in the affected package.jsons",
				value: "affected",
			},
			{
				name: "Skip dependency installation",
				value: "none",
			},
		];

		let inquirerMessage =
			"Do you want to make the dependency changes in the affected package.jsons?";

		if (existsSync(rootPackageJsonPath)) {
			inquirerMessage =
				"A root package.json was detected in your project. Select how you want to proceed:";
			INSTALL_INQUIRER_CHOICES.splice(1, 0, {
				name: "Modify dependencies in the root package.json",
				value: "root",
			});
		}

		printer.printConsoleMessage(
			"info",
			colorizeText(`\nAffected package.jsons:\n${affectedString}`, "cyan"),
		);

		printer.printConsoleMessage(
			"info",
			`\n${colorizeText(
				"This codemod expects the following dependency changes:",
				"cyan",
			)}\n${installedDepsString}\n${unInstalledDepsString}\n`,
		);

		const { install } = await inquirer.prompt<{
			install: InstallationChoice;
		}>({
			type: "list",
			name: "install",
			message: inquirerMessage,
			default: "affected",
			pageSize: INSTALL_INQUIRER_CHOICES.length,
			choices: INSTALL_INQUIRER_CHOICES,
		});

		if (install === "none") {
			printer.printConsoleMessage(
				"info",
				colorizeText("Skipping dependency installation...", "cyan"),
			);
			return;
		}

		if (defaultedToNpm) {
			const PM_INQUIRER_CHOICES = Object.values(lockFilesToPmMap).map((pm) => ({
				name: pm,
				value: pm,
			}));

			const { pm } = await inquirer.prompt<{ pm: PackageManager }>({
				type: "list",
				name: "pm",
				message: "Do you want to override the detected package manager? (npm)",
				default: detectedPackageManager,
				pageSize: PM_INQUIRER_CHOICES.length,
				choices: PM_INQUIRER_CHOICES,
			});

			detectedPackageManager = pm;
		}

		printer.printConsoleMessage(
			"info",
			colorizeText(
				`Using package manager: ${boldText(detectedPackageManager)}\n`,
				"cyan",
			),
		);

		const removeCmd = detectedPackageManager === "npm" ? "uninstall" : "remove";
		const addCmd = detectedPackageManager === "npm" ? "install" : "add";
		let addRootCmd: string;
		switch (detectedPackageManager) {
			case "yarn":
				addRootCmd = "add -W";
				break;
			case "pnpm":
				addRootCmd = "add -w";
				break;
			case "bun":
				addRootCmd = "add";
				break;
			default:
				addRootCmd = "install";
				break;
		}

		if (install === "root") {
			const stopRemovalMessageLoading = printer.withLoaderMessage((loader) =>
				colorizeText(
					`${loader.get("vertical-dots")}  Removing: ${toDelete.join(", ")}...`,
					"cyan",
				),
			);
			try {
				await execPromise(
					`${detectedPackageManager} ${removeCmd} ${toDelete.join(" ")}`,
					{ cwd: rootPath },
				);
			} catch (err) {
				// Fails when no dep
			}
			stopRemovalMessageLoading();

			const stopInstallationMessageLoading = printer.withLoaderMessage(
				(loader) =>
					colorizeText(
						`${loader.get("vertical-dots")}  Installing: ${toInstall.join(
							", ",
						)}...`,
						"cyan",
					),
			);
			try {
				await execPromise(
					`${detectedPackageManager} ${addRootCmd} ${toInstall.join(" ")}`,
					{ cwd: rootPath },
				);
				stopInstallationMessageLoading();
			} catch (err) {
				stopInstallationMessageLoading();
				throw err;
				//
			}
		} else {
			const stopRemovalMessageLoading = printer.withLoaderMessage((loader) =>
				colorizeText(
					`${loader.get("vertical-dots")}  Removing: ${toDelete.join(", ")}...`,
					"cyan",
				),
			);
			for (const packageJsonPath of affectedProjectsPackageJsons) {
				const packageJsonContent = await readFile(packageJsonPath, {
					encoding: "utf-8",
				});

				let packageJson: {
					dependencies?: Record<string, string>;
					devDependencies?: Record<string, string>;
				} = {};
				try {
					packageJson = JSON.parse(packageJsonContent);
				} catch (err) {
					printer.printConsoleMessage(
						"error",
						`Failed to remove dependencies from ${packageJsonPath}. package.json is of invalid format.`,
					);
				}

				if (
					!toDelete.some(
						(dep) =>
							(packageJson.dependencies && dep in packageJson.dependencies) ||
							(packageJson.devDependencies &&
								dep in packageJson.devDependencies),
					)
				) {
					continue;
				}

				try {
					await execPromise(
						`${detectedPackageManager} ${removeCmd} ${toDelete.join(" ")}`,
						{ cwd: dirname(packageJsonPath) },
					);
				} catch (err) {
					// Fails when no dep
				}

				stopRemovalMessageLoading();
			}

			const stopInstallationMessageLoading = printer.withLoaderMessage(
				(loader) =>
					colorizeText(
						`${loader.get("vertical-dots")}  Installing: ${toInstall.join(
							", ",
						)}...`,
						"cyan",
					),
			);
			for (const packageJsonPath of affectedProjectsPackageJsons) {
				if (packageJsonPath === rootPackageJsonPath) {
					try {
						await execPromise(
							`${detectedPackageManager} ${addRootCmd} ${toInstall.join(" ")}`,
							{ cwd: dirname(packageJsonPath) },
						);
					} catch (err) {
						//
					}

					continue;
				}

				try {
					await execPromise(
						`${detectedPackageManager} ${addCmd} ${toInstall.join(" ")}`,
						{ cwd: dirname(packageJsonPath) },
					);
					stopInstallationMessageLoading();
				} catch (err) {
					stopInstallationMessageLoading();
					throw err;
					//
				}
			}
		}

		let installedInString: string;
		if (install === "affected") {
			installedInString = colorizeText(
				affectedProjectsPackageJsons.join("\n"),
				"cyan",
			);
		} else {
			installedInString = colorizeText(
				resolve(target, rootPackageJsonPath),
				"cyan",
			);
		}

		printer.printConsoleMessage(
			"info",
			colorizeText(
				`Successfully installed dependencies:\n\n${installedDepsString}\n${unInstalledDepsString}\n\nin:\n${installedInString}`,
				"green",
			),
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
