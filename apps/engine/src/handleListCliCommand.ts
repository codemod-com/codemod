import * as fs from 'fs';
import { mkdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { isNeitherNullNorUndefined } from '@codemod-com/utilities';
import { glob } from 'glob';
import * as v from 'valibot';
import type { PrinterBlueprint } from './printer.js';

export const handleListNamesCommand = async (printer: PrinterBlueprint) => {
	const intuitaDirectoryPath = join(homedir(), '.intuita');

	await mkdir(intuitaDirectoryPath, { recursive: true });

	const configFiles = await glob('**/config.json', {
		absolute: true,
		cwd: intuitaDirectoryPath,
		fs,
		nodir: true,
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
