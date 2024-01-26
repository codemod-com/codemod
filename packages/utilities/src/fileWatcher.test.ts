import { randomBytes } from 'node:crypto';
import type { PathLike } from 'node:fs';
import { open, rm, writeFile } from 'node:fs/promises';
import { describe, it } from 'vitest';
import { FileWatcher } from './fileWatcher.js';

const withRandomFile = async <T>(
	callback: (pathLike: PathLike) => Promise<T>,
) => {
	const pathLike = `./${randomBytes(20).toString('base64url')}.data`;

	try {
		await writeFile(pathLike, Buffer.from([]));

		await callback(pathLike);
	} finally {
		await rm(pathLike);
	}
};

describe('fileWatcher', function () {
	it('should report the correct number of changes', async function () {
		await withRandomFile(async (pathLike) => {
			let counter = 0;

			const watcher = new FileWatcher(pathLike, () => {
				++counter;
			});

			const fileHandle = await open(pathLike, 'w');

			watcher.watch();
			for (let i = 0; i < 3; ++i) {
				await fileHandle.write(Buffer.from([1]));
			}

			return new Promise<number>((resolve) => {
				const timeout = setInterval(() => {
					if (counter === 3) {
						clearInterval(timeout);
						watcher.close();
						resolve(counter);
					}
				}, 0);
			});
		});
	});
});
