import AdmZip from "adm-zip";
import pako from "pako";
import * as tar from "tar";
import * as tarStream from "tar-stream";
import unzipper from "unzipper";

import { constants, access, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";

const _checkSourceAndCreateTarget = async (source: string, target: string) => {
  await access(source, constants.F_OK).catch(() => {
    throw new Error(`[Archiver]: source ${source} does not exist`);
  });

  await access(target, constants.F_OK).catch(() =>
    mkdir(target, { recursive: true }),
  );
};

const tarWrite = async (source: string, target: string, ignore?: string[]) => {
  await _checkSourceAndCreateTarget(source, dirname(target));

  return tar.c(
    {
      gzip: true,
      file: target,
      cwd: source,
      filter: (path) => !ignore?.includes(path),
    },
    await readdir(source),
  );
};

const tarExtract = async (source: string, target: string) => {
  await _checkSourceAndCreateTarget(source, target);

  return tar.x({ file: source, cwd: target });
};

const zipExtract = async (source: string, target: string) => {
  await _checkSourceAndCreateTarget(source, target);

  await unzipper.Open.file(source).then((d) =>
    d.extract({ path: target, concurrency: 5 }),
  );

  return target;
};

const tarExtractInMemory = async (
  buffer: Buffer,
  outputDir: string,
): Promise<void> => {
  // Decompress the buffer using pako
  const decompressedBuffer = Buffer.from(pako.ungzip(buffer));

  const extractStream = tarStream.extract();
  extractStream.on("entry", async (header, stream, next) => {
    const filePath = join(outputDir, header.name);

    // Ensure the directory exists
    await mkdir(dirname(filePath), { recursive: true });

    // Write the file content
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", async () => {
      await writeFile(filePath, Buffer.concat(chunks));
      next();
    });
  });

  // Pipe the decompressed buffer into the tar extract stream
  const bufferStream = new Readable({
    read() {
      this.push(decompressedBuffer);
      this.push(null);
    },
  });

  bufferStream.pipe(extractStream);

  return new Promise<void>((resolve, reject) => {
    extractStream.on("finish", resolve);
    extractStream.on("error", reject);
  });
};

const tarWriteInMemory = async (
  files: { name: string; data: Buffer }[],
): Promise<Buffer> => {
  const pack = tarStream.pack();

  for (const { name, data } of Object.values(files)) {
    pack.entry({ name }, data);
  }

  pack.finalize();

  const chunks: Buffer[] = [];
  pack.on("data", (chunk) => chunks.push(chunk));

  await new Promise<void>((resolve, reject) => {
    pack.on("end", resolve);
    pack.on("error", reject);
  });

  // Compress the tar buffer using pako
  const compressedBuffer = Buffer.from(pako.gzip(Buffer.concat(chunks)));

  return compressedBuffer;
};

const zipWriteInMemory = async (
  files: { name: string; data: Buffer }[],
): Promise<Buffer> => {
  const zip = new AdmZip();

  for (const { name, data } of Object.values(files)) {
    zip.addFile(name, data);
  }

  return zip.toBuffer();
};

export {
  tarWrite as tar,
  tarExtract as untar,
  zipWriteInMemory as zipInMemory,
  zipExtract as unzip,
  tarWriteInMemory as tarInMemory,
  tarExtractInMemory as untarInMemory,
};
