import { equal } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'vitest';
import { TarService } from '../src/services/tarService.js';

describe('TarService', function () {
	it('should extract the registry.tar.gz file', async function () {
		const volume = Volume.fromJSON({});
		const ifs = createFsFromVolume(volume);

		const tarService = new TarService(ifs);

		const path = join(
			dirname(import.meta.url.replace('file:', '')),
			'registry.tar.gz',
		);

		const buffer = await readFile(path);

		await tarService.extract('/home/user/.codemod', buffer);

		{
			const stats = await ifs.promises.stat(
				'/home/user/.codemod/names.json',
			);

			equal(stats.size.toString(), 1814);
		}

		{
			const stats = await ifs.promises.stat(
				'/home/user/.codemod/-wqkAQr7ILgYeTRozWTEgiUvmSY/config.json',
			);

			equal(stats.size.toString(), 45);
		}

		{
			const stats = await ifs.promises.stat(
				'/home/user/.codemod/-wqkAQr7ILgYeTRozWTEgiUvmSY/index.cjs',
			);

			equal(stats.size.toString(), 18020);
		}

		// do it again to simulate another command invocation
		await tarService.extract('/home/user/.codemod', buffer);

		{
			const stats = await ifs.promises.stat(
				'/home/user/.codemod/names.json',
			);

			equal(stats.size.toString(), 1814);
		}
	});
});
