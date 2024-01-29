import { IFs } from 'memfs';
import { dirname, join } from 'node:path';
import * as tar from 'tar';

export class TarService {
	public constructor(protected readonly _ifs: IFs) {}

	public async extract(
		rootDirectoryPath: string,
		buffer: Buffer,
	): Promise<void> {
		const bufferMap = new Map<string, ReadonlyArray<Buffer>>();

		await new Promise<void>((resolve, reject) => {
			let finished = false;
			let remainingEntryCount = 0;

			const parse = tar.list();

			const conditionalResolve = () => {
				if (finished && remainingEntryCount === 0) {
					resolve();
				}
			};

			const entryHandler = (entry: tar.ReadEntry): void => {
				if (entry.type !== 'File') {
					return;
				}

				++remainingEntryCount;

				const dataHandler = (data: Buffer): void => {
					const buffers = bufferMap.get(entry.path)?.slice() ?? [];
					buffers.push(data);

					bufferMap.set(entry.path, buffers);
				};

				entry.on('data', dataHandler);

				entry.once('error', (error) => {
					entry.off('data', dataHandler);
					parse.off('entry', entryHandler);

					reject(error);
				});

				entry.once('finish', () => {
					entry.off('data', dataHandler);
					--remainingEntryCount;

					conditionalResolve();
				});
			};

			parse.on('entry', entryHandler);

			parse.once('error', (error) => {
				parse.off('entry', entryHandler);
				reject(error);
			});

			parse.once('finish', () => {
				parse.off('entry', entryHandler);
				finished = true;

				conditionalResolve();
			});

			parse.write(buffer);
			parse.end();
		});

		for (const [path, buffers] of bufferMap) {
			const absolutePath = join(rootDirectoryPath, path);

			await this._ifs.promises.mkdir(dirname(absolutePath), {
				recursive: true,
			});

			await this._ifs.promises.writeFile(absolutePath, buffers.join(''));
		}
	}
}
