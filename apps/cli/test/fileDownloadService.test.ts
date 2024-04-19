import { deepEqual } from "node:assert";
import type { PrinterBlueprint } from "@codemod-com/printer";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { FileDownloadService } from "../src/fileDownloadService.js";

describe("FileDownloadService", () => {
	const FILE_PATH = "file.ts";
	const OLD_CONTENT = "OLD_CONTENT";
	const NEW_CONTENT = "NEW_CONTENT";

	const printer: PrinterBlueprint = {
		__jsonOutput: false,
		printMessage: () => {},
		printOperationMessage: () => {},
		printConsoleMessage: () => {},
		withLoaderMessage: (() => {}) as any,
	};

	const URL = "http://example.com";

	it("should download the new content of the file if cache is disabled", async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(true, ifs, printer);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(NEW_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(NEW_CONTENT));
	});

	it("should download the new content of the file if cache is enabled and time threashold is achieved", async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(false, ifs, printer);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(NEW_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(NEW_CONTENT));
	});

	it("should keep the old content of the file if cache is enabled and time threashold is not achieved", async () => {
		const volume = Volume.fromJSON({
			[FILE_PATH]: OLD_CONTENT,
		});

		const ifs = createFsFromVolume(volume);

		const fileDownloadService = new FileDownloadService(false, ifs, printer);

		const buffer = await fileDownloadService.download(URL, FILE_PATH);

		deepEqual(buffer, Buffer.from(OLD_CONTENT));

		const tDataOut = volume.readFileSync(FILE_PATH);

		deepEqual(tDataOut, Buffer.from(OLD_CONTENT));
	});
});
