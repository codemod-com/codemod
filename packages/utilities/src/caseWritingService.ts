/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import type { IFileHandle } from "memfs/lib/node/types/misc.js";
import type { SurfaceAgnosticCase } from "./schemata/surfaceAgnosticCaseSchema.js";
import type { SurfaceAgnosticJob } from "./schemata/surfaceAgnosticJobSchema.js";
import { JOB_KIND } from "./schemata/surfaceAgnosticJobSchema.js";

export const createHashDigest = (buffer: Buffer): Buffer =>
	createHash("ripemd160").update(buffer).digest();

const buildUint8Buffer = (value: number): Buffer => {
	if (value > 0xff - 1) {
		throw new Error("The passed value exceeds 0xFF - 1");
	}

	const buffer = Buffer.alloc(1);
	buffer.writeUint8(value & 0xff);

	return buffer;
};

const buildUint16Buffer = (value: number): Buffer => {
	if (value > 0xffff - 1) {
		throw new Error("The passed value exceeds 0xFFFF - 1");
	}

	const buffer = Buffer.alloc(2);

	buffer.writeUint16BE(value & 0xffff);

	return buffer;
};

const buildBigIntBuffer = (bi: bigint): Buffer => {
	const buffer = Buffer.alloc(8);
	buffer.writeBigInt64BE(bi);

	return buffer;
};

const buildStringBuffer = (str: string): Buffer => {
	const MAXIMUM_LENGTH = 16 * 1024 - 1;

	const stringBuffer = Buffer.from(str);

	if (stringBuffer.byteLength > MAXIMUM_LENGTH) {
		throw new Error(`The string byte length is greater than ${MAXIMUM_LENGTH}`);
	}

	const lengthBuffer = buildUint16Buffer(stringBuffer.byteLength);

	return Buffer.concat([lengthBuffer, stringBuffer]);
};

export const serializePreamble = (): Buffer =>
	Buffer.concat([
		Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]),
		new Uint8Array([1, 0, 0, 0]),
	]);

export const serializeCase = (kase: SurfaceAgnosticCase): Buffer => {
	const innerBuffer = Buffer.concat([
		Buffer.from(kase.caseHashDigest, "base64url").subarray(0, 20),
		Buffer.from(kase.codemodHashDigest, "base64url").subarray(0, 20),
		buildBigIntBuffer(kase.createdAt),
		buildStringBuffer(kase.absoluteTargetPath),
		buildStringBuffer(JSON.stringify(kase.argumentRecord)),
	]);

	const hashDigest = createHashDigest(innerBuffer);

	return Buffer.concat([
		Buffer.from([0xa1, 0xb1, 0xc1, 0xd1]),
		buildUint16Buffer(innerBuffer.byteLength),
		hashDigest,
		innerBuffer,
	]);
};

export const serializeJob = (job: SurfaceAgnosticJob): Buffer => {
	const buffers: Buffer[] = [
		Buffer.from(job.jobHashDigest, "base64url").subarray(0, 20),
		buildUint8Buffer(job.kind),
	];

	if (job.kind === JOB_KIND.CREATE_FILE) {
		buffers.push(buildStringBuffer(job.pathUri));
		buffers.push(buildStringBuffer(job.dataUri));
	} else if (job.kind === JOB_KIND.UPDATE_FILE) {
		buffers.push(buildStringBuffer(job.pathUri));
		buffers.push(buildStringBuffer(job.newDataUri));
	} else if (job.kind === JOB_KIND.MOVE_FILE) {
		buffers.push(buildStringBuffer(job.oldPathUri));
		buffers.push(buildStringBuffer(job.newPathUri));
	} else if (job.kind === JOB_KIND.MOVE_AND_UPDATE_FILE) {
		buffers.push(buildStringBuffer(job.oldPathUri));
		buffers.push(buildStringBuffer(job.newPathUri));
		buffers.push(buildStringBuffer(job.newDataUri));
	} else if (job.kind === JOB_KIND.DELETE_FILE) {
		buffers.push(buildStringBuffer(job.pathUri));
	} else if (job.kind === JOB_KIND.COPY_FILE) {
		buffers.push(buildStringBuffer(job.sourcePathUri));
		buffers.push(buildStringBuffer(job.targetPathUri));
	}

	const innerBuffer = Buffer.concat(buffers);

	const hashDigest = createHashDigest(innerBuffer);

	return Buffer.concat([
		Buffer.from([0xa2, 0xb2, 0xc2, 0xd2]),
		buildUint16Buffer(innerBuffer.byteLength),
		hashDigest,
		innerBuffer,
	]);
};

export const serializePostamble = (hashDigest: Buffer) =>
	Buffer.concat([Buffer.from([0xdd, 0xcc, 0xbb, 0xaa]), hashDigest]);

export interface CaseWritingService extends EventEmitter {
	once(event: "error", callback: (error: Error) => void): this;
	once(event: "finish", callback: () => void): this;
	emit(event: "error", error: Error): boolean;
	emit(event: "finish"): boolean;
}

enum MODE {
	AWAITING_CASE = 1,
	AWAITING_JOBS = 2,
	ENDED = 3,
}

export class CaseWritingService extends EventEmitter {
	private __mode: MODE = MODE.AWAITING_CASE;

	private __hash = createHash("ripemd160");

	public constructor(
		private readonly __fileHandle: Pick<IFileHandle, "write" | "close">,
	) {
		super();
	}

	public async writeCase(kase: SurfaceAgnosticCase) {
		try {
			if (this.__fileHandle === null || this.__mode !== MODE.AWAITING_CASE) {
				return;
			}

			const preamble = serializePreamble();
			await this.__fileHandle.write(preamble);

			const outerBuffer = serializeCase(kase);

			await this.__fileHandle.write(outerBuffer);

			this.__hash.update(outerBuffer);

			this.__mode = MODE.AWAITING_JOBS;
		} catch (error) {
			await this.__fileHandle?.close();

			this.emit("error", error instanceof Error ? error : new Error());
		}
	}

	public async writeJob(job: SurfaceAgnosticJob) {
		try {
			if (this.__fileHandle === null || this.__mode !== MODE.AWAITING_JOBS) {
				return;
			}

			const buffer = serializeJob(job);

			await this.__fileHandle.write(buffer);

			this.__hash.update(buffer);
		} catch (error) {
			await this.__fileHandle?.close();

			this.emit("error", error instanceof Error ? error : new Error());
		}
	}

	public async finish() {
		try {
			if (this.__fileHandle === null || this.__mode !== MODE.AWAITING_JOBS) {
				return;
			}

			this.__mode = MODE.ENDED;

			await this.__fileHandle.write(serializePostamble(this.__hash.digest()));
			await this.__fileHandle.close();

			// writers emit finish, readers emit end
			this.emit("finish");
		} catch (error) {
			await this.__fileHandle?.close();

			this.emit("error", error instanceof Error ? error : new Error());
		}
	}
}
