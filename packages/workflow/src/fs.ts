/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as glob from 'glob';
import { fileContext, getCwdContext } from './contexts';

let DIRECTORY = 'cm';

// A description why we are doing it this way would be nice to have.
// Is this dependency injection? Why do we need it that way?
let filenamify = async (a: string) => {
	let module =
		// biome-ignore lint/security/noGlobalEval: <explanation>
		((await eval('import("filenamify")')) as typeof import('filenamify'))
			.default;
	return module(a);
};

let slugify = async (a: string) => {
	type Slugify = typeof import('@sindresorhus/slugify');
	// biome-ignore lint/security/noGlobalEval: <explanation>
	let module = ((await eval('import("@sindresorhus/slugify")')) as Slugify)
		.default;
	return module(a);
};

export let getTmpDir = async (...rawParts: string[]) => {
	let parts = await Promise.all(
		rawParts.map(async (part) => {
			let slug = await slugify(part);
			return await filenamify(slug);
		}),
	);
	let dirpath = path.join(os.tmpdir(), DIRECTORY, ...parts);

	return dirpath;
};

export let rm = async (dir: string) => {
	await fs.rm(dir, {
		recursive: true,
		force: true,
		retryDelay: 1000,
		maxRetries: 5,
	});
};

export let files = async (
	pattern: string | string[],
	cb: () => Promise<void>,
) => {
	let { cwd } = getCwdContext();
	let files = await glob.glob(pattern, { cwd, nodir: true });
	for (let file of files) {
		await fileContext.run(
			{ file: path.join(cwd, file), importsUpdates: [] },
			cb,
		);
	}
};

export let jsonFiles = async <T,>(
	pattern: string | string[],
	cb: (args: {
		update: (updater: T | ((input: T) => T | Promise<T>)) => Promise<void>;
	}) => Promise<void>,
) => {
	let { cwd } = getCwdContext();
	let files = await glob.glob(pattern, { cwd, nodir: true });
	await cb({
		update: async (updater: T | ((input: T) => T | Promise<T>)) => {
			for (let file of files) {
				let filepath = path.join(cwd, file);
				if (typeof updater === 'function') {
					let contents = JSON.parse(
						await fs.readFile(filepath, 'utf-8'),
					);
					// @ts-ignore
					let updatedContents = (await updater(contents)) as T;
					await fs.writeFile(
						filepath,
						JSON.stringify(updatedContents, null, 2),
					);
				} else {
					await fs.writeFile(
						filepath,
						JSON.stringify(updater, null, 2),
					);
				}
			}
		},
	});
};

export let isDirectory = async (dir: string) => {
	try {
		let stats = await fs.stat(dir);
		await fs.access(
			dir,
			fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK,
		);
		return stats.isDirectory();
	} catch {
		return false;
	}
};
