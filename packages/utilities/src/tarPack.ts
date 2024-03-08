import zlib from "zlib";
import bl from "bl";
import * as tarStream from "tar-stream";

export async function tarPack(buffers: { name: string; data: Buffer }[]) {
	// Create a pack object, which is a writable stream
	const pack = tarStream.pack();

	// Add each buffer as an entry in the tar archive
	buffers.forEach(({ name, data }) => {
		pack.entry({ name }, data, (err) => {
			if (err) throw err;
		});
	});

	// Finalize the archive (indicates no more entries will be added)
	pack.finalize();

	// Create a gzip stream to compress the tar archive
	const gzip = zlib.createGzip();

	// Collect the gzipped tar stream into a single buffer
	let tarBuffer: Buffer | null = null;
	const collectStream = bl((err, buffer) => {
		if (err) throw err;

		tarBuffer = buffer;
	});

	// Pipe the tar pack through the gzip stream, then into the buffer collector
	pack.pipe(gzip).pipe(collectStream);

	// Return on finish
	await new Promise<void>((resolve) => {
		collectStream.on("finish", () => {
			resolve();
		});
	});

	if (tarBuffer === null) {
		throw new Error("Failed writing tar gz buffer.");
	}

	// TypeScript :*
	return tarBuffer as Buffer;
}
