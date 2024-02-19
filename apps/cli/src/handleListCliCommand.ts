import * as fs from 'fs';
import { mkdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { isNeitherNullNorUndefined } from '@codemod-com/utilities';
import { glob } from 'fast-glob';
import * as v from 'valibot';
import { syncRegistryOperation } from './executeMainThread.js';
import { FileDownloadService } from './fileDownloadService.js';
import type { Printer } from './printer.js';
import { TarService } from './services/tarService.js';

export const handleListNamesCommand = async (printer: Printer) => {
	const configurationDirectoryPath = join(homedir(), '.codemod');

	await mkdir(configurationDirectoryPath, { recursive: true });

	const configFiles = await glob('**/config.json', {
		absolute: true,
		cwd: configurationDirectoryPath,
		fs,
		onlyFiles: true,
	});

	const codemodNames = await Promise.allSettled(
		configFiles.map(async (cfg) => {
			const configJson = await readFile(cfg, 'utf8');

			const parsedConfig = v.safeParse(
				v.object({ name: v.string() }),
				JSON.parse(configJson),
			);
			return parsedConfig.success ? parsedConfig.output.name : null;
		}),
	);

	const onlyValid = codemodNames
		.map((x) => (x.status === 'fulfilled' ? x.value : null))
		.filter(isNeitherNullNorUndefined)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

	const names = v.parse(v.array(v.string()), onlyValid);

	printer.printOperationMessage({ kind: 'names', names });
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
