import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { FileDownloadService } from '../src/fileDownloadService.js';
import { deepEqual } from 'assert';
import { PrinterBlueprint } from '../src/printer.js';

describe('FileDownloadService', function () {
	const FILE_PATH = 'file.ts';
	const OLD_CONTENT = 'OLD_CONTENT';
	const NEW_CONTENT = 'NEW_CONTENT';

	const OLD_MTIME = 1;
	const NOW = 24 * 60 * 60 * 1000;
	const NEW_MTIME = NOW + OLD_MTIME * 1000;

	const printer: PrinterBlueprint = {
		printMessage: () => {},
		printOperationMessage: () => {},
		printConsoleMessage: () => {},
	};

	const URL = 'http://example.com';

	it('should download the new content of the file if cache is disabled', async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		volume.utimesSync(FILE_PATH, OLD_MTIME, OLD_MTIME);

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(
			false,
			() => Promise.resolve(Buffer.from(NEW_CONTENT)),
			() => NEW_MTIME,
			ifs,
			printer,
		);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(NEW_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(NEW_CONTENT));
	});

	it('should download the new content of the file if cache is enabled and time threashold is achieved', async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		volume.utimesSync(FILE_PATH, OLD_MTIME, OLD_MTIME);

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(
			true,
			() => Promise.resolve(Buffer.from(NEW_CONTENT)),
			() => NEW_MTIME,
			ifs,
			printer,
		);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(NEW_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(NEW_CONTENT));
	});

	it('should keep the old content of the file if cache is enabled and time threashold is not achieved', async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		volume.utimesSync(FILE_PATH, OLD_MTIME, OLD_MTIME);

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(
			true,
			() => Promise.resolve(Buffer.from(NEW_CONTENT)),
			() => OLD_MTIME,
			ifs,
			printer,
		);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(OLD_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(OLD_CONTENT));
	});
});
