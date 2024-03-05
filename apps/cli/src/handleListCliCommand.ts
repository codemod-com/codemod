import * as fs from "fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import columnify from "columnify";
import { glob } from "fast-glob";
import * as v from "valibot";
import { syncRegistryOperation } from "./executeMainThread.js";
import { FileDownloadService } from "./fileDownloadService.js";
import type { Printer, PrinterBlueprint } from "./printer.js";
import { TarService } from "./services/tarService.js";
import { boldText, colorizeText } from "./utils.js";

const configJsonSchema = v.object({
	name: v.string(),
	engine: v.string(),
	owner: v.optional(v.string()),
});

export const getConfigFiles = async () => {
	const configurationDirectoryPath = join(homedir(), ".codemod");

	const configFiles = await glob("**/.codemodrc.json", {
		absolute: true,
		cwd: configurationDirectoryPath,
		fs,
		onlyFiles: true,
	});

	const codemodObjects = await Promise.all(
		configFiles.map(async (cfg) => {
			let configJson: string | null = null;
			try {
				configJson = await readFile(cfg, "utf8");
			} catch (e) {
				return null;
			}

			const parsedConfig = v.safeParse(
				configJsonSchema,
				JSON.parse(configJson),
			);

			if (!parsedConfig.success) {
				return null;
			}

			return parsedConfig.output;
		}),
	);

	return codemodObjects.filter(isNeitherNullNorUndefined);
};

export const handleListNamesCommand = async (
	printer: PrinterBlueprint,
	short?: boolean,
) => {
	const configObjects = await getConfigFiles();

	// required for vsce
	if (short) {
		const names = configObjects.map(({ name }) => name);
		printer.printOperationMessage({ kind: "names", names });
		return;
	}

	const prettified = configObjects
		.map(({ name, engine, owner }) => {
			if (owner?.toLocaleLowerCase() === "codemod.com") {
				return {
					name: boldText(colorizeText(name, "cyan")),
					engine: boldText(colorizeText(engine, "cyan")),
					owner: boldText(colorizeText(owner, "cyan")),
				};
			}

			return {
				name,
				engine,
				owner: owner ?? "Community",
			};
		})
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	printer.printConsoleMessage(
		"info",
		columnify(prettified, {
			headingTransform: (heading) => boldText(heading.toLocaleUpperCase()),
		}),
	);

	printer.printConsoleMessage(
		"info",
		"\nColored codemods are verified by the Codemod.com engineering team",
	);
};

export const handleListNamesAfterSyncing = async (
	disableCache: boolean,
	short: boolean,
	printer: Printer,
	fileDownloadService: FileDownloadService,
	tarService: TarService,
) => {
	await syncRegistryOperation(
		disableCache,
		printer,
		fileDownloadService,
		tarService,
	);

	await handleListNamesCommand(printer, short);
};
