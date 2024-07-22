import { dirname, join } from "node:path";
import zlib from "node:zlib";

import bl from "bl";
import * as tar from "tar";
import * as tarStream from "tar-stream";

import type { FileSystem } from "../schemata/types.js";

export class TarService {
  public constructor(protected readonly _fs: FileSystem) {}

  public async unpack(
    rootDirectoryPath: string,
    buffer: Buffer,
  ): Promise<string> {
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
        if (entry.type !== "File") {
          return;
        }

        ++remainingEntryCount;

        const dataHandler = (data: Buffer): void => {
          const buffers = bufferMap.get(entry.path)?.slice() ?? [];
          buffers.push(data);

          bufferMap.set(entry.path, buffers);
        };

        entry.on("data", dataHandler);

        entry.once("error", (error) => {
          entry.off("data", dataHandler);
          parse.off("entry", entryHandler);

          reject(error);
        });

        entry.once("finish", () => {
          entry.off("data", dataHandler);
          --remainingEntryCount;

          conditionalResolve();
        });
      };

      parse.on("entry", entryHandler);

      parse.once("error", (error) => {
        parse.off("entry", entryHandler);
        reject(error);
      });

      parse.once("finish", () => {
        parse.off("entry", entryHandler);
        finished = true;

        conditionalResolve();
      });

      parse.write(buffer);
      parse.end();
    });

    for (const [path, buffers] of bufferMap) {
      const absolutePath = join(rootDirectoryPath, path);

      await this._fs.promises.mkdir(dirname(absolutePath), {
        recursive: true,
      });

      await this._fs.promises.writeFile(absolutePath, buffers.join(""));
    }

    return rootDirectoryPath;
  }

  public async pack(buffers: { name: string; data: Buffer }[]) {
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
}
