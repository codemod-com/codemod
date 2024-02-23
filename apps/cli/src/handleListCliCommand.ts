import * as fs from "fs";
import { mkdir, readFile } from "node:fs/promises";
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

export const handleListNamesCommand = async (printer: PrinterBlueprint) => {
	const configurationDirectoryPath = join(homedir(), ".codemod");

	await mkdir(configurationDirectoryPath, { recursive: true });

	const configFiles = await glob("**/config.json", {
		absolute: true,
		cwd: configurationDirectoryPath,
		fs,
		onlyFiles: true,
	});

	const codemodObjects = await Promise.allSettled(
		configFiles.map(async (cfg) => {
			const configJson = await readFile(cfg, "utf8");

			const parsedConfig = v.safeParse(
				configJsonSchema,
				JSON.parse(configJson),
			);

			if (!parsedConfig.success) {
				return null;
			}

			const { name, engine, owner } = parsedConfig.output;

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
		}),
	);

	const onlyValid = codemodObjects
		.map((x) => (x.status === "fulfilled" ? x.value : null))
		.filter(isNeitherNullNorUndefined)
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	const parsedObjects = v.parse(v.array(configJsonSchema), onlyValid);

	printer.printConsoleMessage(
		"info",
		columnify(parsedObjects, {
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
	await handleListNamesCommand(printer);
};
