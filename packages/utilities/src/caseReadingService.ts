/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Hash } from "node:crypto";
import { createHash } from "node:crypto";
import EventEmitter from "node:events";
import { type PathLike } from "node:fs";
import { CircularBuffer } from "./circularBuffer.js";
import { FileReadingService } from "./fileReadingService.js";
import { FileWatcher } from "./fileWatcher.js";
import { parseArgumentRecordSchema } from "./schemata/argumentRecordSchema.js";
import type { SurfaceAgnosticCase } from "./schemata/surfaceAgnosticCaseSchema.js";
import {
	JOB_KIND,
	type SurfaceAgnosticJob,
} from "./schemata/surfaceAgnosticJobSchema.js";

type OuterData = Readonly<{
	byteLength: number;
	hashDigest: Buffer;
	innerData: Buffer;
}>;

type OuterCase = OuterData & { kind: "case" };

type OuterJob = OuterData & { kind: "job" };

const buildCase = (outerCase: OuterCase): SurfaceAgnosticCase => {
	const innerDataHashDigest = createHash("ripemd160")
		.update(outerCase.innerData)
		.digest();

	if (Buffer.compare(innerDataHashDigest, outerCase.hashDigest) !== 0) {
		throw new Error(
			"The inner case's hash digest does not match the calculated hash digest",
		);
	}

	const caseHashDigest = outerCase.innerData
		.subarray(0, 20)
		.toString("base64url");
	const codemodHashDigest = outerCase.innerData
		.subarray(20, 40)
		.toString("base64url");

	const createdAt = outerCase.innerData.subarray(40, 48).readBigInt64BE();

	const pathByteLength = outerCase.innerData.subarray(48, 50).readUint16BE();

	const recordByteLengthStart = 50 + pathByteLength;

	const absoluteTargetPath = outerCase.innerData
		.subarray(50, recordByteLengthStart)
		.toString();

	const recordByteLength = outerCase.innerData
		.subarray(recordByteLengthStart, recordByteLengthStart + 2)
		.readUint16BE();

	const record = outerCase.innerData
		.subarray(
			recordByteLengthStart + 2,
			recordByteLengthStart + 2 + recordByteLength,
		)
		.toString();

	const argumentRecord = parseArgumentRecordSchema(JSON.parse(record));

	return {
		caseHashDigest,
		codemodHashDigest,
		createdAt,
		absoluteTargetPath,
		argumentRecord,
	};
};

const buildJob = (outerJob: OuterJob): SurfaceAgnosticJob => {
	const innerDataHashDigest = createHash("ripemd160")
		.update(outerJob.innerData)
		.digest();

	if (Buffer.compare(innerDataHashDigest, outerJob.hashDigest) !== 0) {
		throw new Error(
			"The inner job's hash digest does not match the calculated hash digest",
		);
	}

	const jobHashDigest = outerJob.innerData
		.subarray(0, 20)
		.toString("base64url");

	const kind = outerJob.innerData.subarray(20).readUInt8();

	const readUris = (bufferCount: number) => {
		const uris: string[] = [];
		let start = 21,
			end = 23;

		for (let i = 0; i < bufferCount; ++i) {
			const byteLength = outerJob.innerData.subarray(start, end).readUint16BE();

			uris.push(outerJob.innerData.subarray(end, end + byteLength).toString());

			start += byteLength + 2;
			end += byteLength + 2;
		}

		return uris;
	};

	if (kind === JOB_KIND.CREATE_FILE) {
		const [pathUri, dataUri] = readUris(2);

		return {
			jobHashDigest,
			kind,
			pathUri: pathUri?.toString() ?? "",
			dataUri: dataUri?.toString() ?? "",
		};
	}

	if (kind === JOB_KIND.UPDATE_FILE) {
		const [pathUri, newDataUri] = readUris(2);

		return {
			jobHashDigest,
			kind,
			pathUri: pathUri?.toString() ?? "",
			newDataUri: newDataUri?.toString() ?? "",
		};
	}

	if (kind === JOB_KIND.MOVE_FILE) {
		const [oldPathUri, newPathUri] = readUris(2);

		return {
			jobHashDigest,
			kind,
			oldPathUri: oldPathUri?.toString() ?? "",
			newPathUri: newPathUri?.toString() ?? "",
		};
	}

	if (kind === JOB_KIND.MOVE_AND_UPDATE_FILE) {
		const [oldPathUri, newPathUri, newDataUri] = readUris(3);

		return {
			jobHashDigest,
			kind,
			oldPathUri: oldPathUri?.toString() ?? "",
			newPathUri: newPathUri?.toString() ?? "",
			newDataUri: newDataUri?.toString() ?? "",
		};
	}

	if (kind === JOB_KIND.DELETE_FILE) {
		const [pathUri] = readUris(1);

		return {
			jobHashDigest,
			kind,
			pathUri: pathUri?.toString() ?? "",
		};
	}

	if (kind === JOB_KIND.COPY_FILE) {
		const [sourcePathUri, targetPathUri] = readUris(2);

		return {
			jobHashDigest,
			kind,
			sourcePathUri: sourcePathUri?.toString() ?? "",
			targetPathUri: targetPathUri?.toString() ?? "",
		};
	}

	throw new Error("The job kind is not recognized.");
};

enum POSITION {
	BEFORE_PREAMBLE = 0,
	BEFORE_OUTER_CASE = 1,
	BEFORE_INNER_CASE = 2,
	BEFORE_OUTER_JOB_OR_POSTAMBLE = 3,
	BEFORE_INNER_JOB_BYTE_LENGTH = 4,
	BEFORE_INNER_JOB = 5,
	BEFORE_POSTAMBLE_HASH_DIGEST = 9,
}

type State = Readonly<{
	position: POSITION;
	outerCase: OuterCase | null;
	outerJob: OuterJob | null;
}>;

const getByteLength = (state: State): number => {
	if (state.position === POSITION.BEFORE_PREAMBLE) {
		return 8;
	}

	if (state.position === POSITION.BEFORE_OUTER_CASE) {
		return 4 + 2 + 20;
	}

	if (
		state.position === POSITION.BEFORE_INNER_CASE &&
		state.outerCase !== null
	) {
		return state.outerCase.byteLength;
	}

	if (state.position === POSITION.BEFORE_OUTER_JOB_OR_POSTAMBLE) {
		return 4;
	}

	if (state.position === POSITION.BEFORE_INNER_JOB_BYTE_LENGTH) {
		return 2 + 20;
	}

	if (state.position === POSITION.BEFORE_INNER_JOB && state.outerJob !== null) {
		return state.outerJob.byteLength;
	}

	if (state.position === POSITION.BEFORE_POSTAMBLE_HASH_DIGEST) {
		return 20;
	}

	throw new Error(
		"Could not get the readable byte length for the current state",
	);
};

type StateRecipe =
	| Readonly<{
			event: "error";
			error: Error;
	  }>
	| (Readonly<{
			event: "case";
			surfaceAgnosticCase: SurfaceAgnosticCase;
	  }> &
			State)
	| (Readonly<{
			event: "job";
			surfaceAgnosticJob: SurfaceAgnosticJob;
	  }> &
			State)
	| Readonly<{
			event: "end";
			hashDigest: Buffer;
	  }>
	| State;

const read = (buffer: Buffer, state: State): StateRecipe => {
	if (state.position === POSITION.BEFORE_PREAMBLE) {
		if (
			Buffer.compare(
				buffer.subarray(0, 4),
				Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]),
			) !== 0
		) {
			return {
				event: "error",
				error: new Error("You tried to read a file that is not Codemod Case"),
			};
		}

		if (
			Buffer.compare(buffer.subarray(4, 8), new Uint8Array([1, 0, 0, 0])) !== 0
		) {
			return {
				event: "error",
				error: new Error(),
			};
		}

		return {
			...state,
			position: POSITION.BEFORE_OUTER_CASE,
		};
	}

	if (state.position === POSITION.BEFORE_OUTER_CASE) {
		if (
			Buffer.compare(
				buffer.subarray(0, 4),
				Buffer.from([0xa1, 0xb1, 0xc1, 0xd1]),
			) !== 0
		) {
			return {
				event: "error",
				error: new Error("Expect to find the case header"),
			};
		}

		return {
			...state,
			outerCase: {
				kind: "case",
				byteLength: buffer.subarray(4, 6).readUint16BE(),
				innerData: Buffer.from([]),
				hashDigest: buffer.subarray(6),
			},
			position: POSITION.BEFORE_INNER_CASE,
		};
	}

	if (
		state.position === POSITION.BEFORE_INNER_CASE &&
		state.outerCase !== null
	) {
		try {
			const surfaceAgnosticCase = buildCase({
				...state.outerCase,
				innerData: buffer,
			});

			return {
				...state,
				outerCase: null,
				position: POSITION.BEFORE_OUTER_JOB_OR_POSTAMBLE,
				event: "case",
				surfaceAgnosticCase,
			};
		} catch (error) {
			return {
				event: "error",
				error:
					error instanceof Error
						? error
						: new Error("Unknown case creation error"),
			};
		}
	}

	if (state.position === POSITION.BEFORE_OUTER_JOB_OR_POSTAMBLE) {
		if (Buffer.compare(buffer, Buffer.from([0xa2, 0xb2, 0xc2, 0xd2])) === 0) {
			return {
				...state,
				position: POSITION.BEFORE_INNER_JOB_BYTE_LENGTH,
			};
		}

		if (Buffer.compare(buffer, Buffer.from([0xdd, 0xcc, 0xbb, 0xaa])) === 0) {
			return {
				...state,
				position: POSITION.BEFORE_POSTAMBLE_HASH_DIGEST,
			};
		}

		return {
			event: "error",
			error: new Error("Could not recognize neither job or postamble headers"),
		};
	}

	if (state.position === POSITION.BEFORE_INNER_JOB_BYTE_LENGTH) {
		return {
			...state,
			outerJob: {
				kind: "job",
				byteLength: buffer.subarray(0, 2).readUint16BE(),
				hashDigest: buffer.subarray(2),
				innerData: Buffer.from([]),
			},
			position: POSITION.BEFORE_INNER_JOB,
		};
	}

	if (state.position === POSITION.BEFORE_INNER_JOB && state.outerJob !== null) {
		try {
			const surfaceAgnosticJob = buildJob({
				...state.outerJob,
				innerData: buffer,
			});

			return {
				...state,
				position: POSITION.BEFORE_OUTER_JOB_OR_POSTAMBLE,
				outerJob: null,
				event: "job",
				surfaceAgnosticJob,
			};
		} catch (error) {
			return {
				event: "error",
				error:
					error instanceof Error
						? error
						: new Error("Unknown job creation error"),
			};
		}
	}

	if (state.position === POSITION.BEFORE_POSTAMBLE_HASH_DIGEST) {
		return {
			event: "end",
			hashDigest: buffer,
		};
	}

	throw new Error();
};

export interface CaseReadingService extends EventEmitter {
	once(event: "error", callback: (error: Error) => void): this;
	once(event: "finish", callback: () => void): this;
	once(event: "case", callback: (kase: SurfaceAgnosticCase) => void): this;
	on(event: "job", callback: (job: SurfaceAgnosticJob) => void): this;

	emit(event: "error", error: Error): boolean;
	emit(event: "finish"): boolean;
	emit(event: "case", kase: SurfaceAgnosticCase): boolean;
	emit(event: "job", kase: SurfaceAgnosticJob): boolean;
}

export class CaseReadingService extends EventEmitter {
	protected _circularBuffer: CircularBuffer;
	protected _fileReadingService: FileReadingService;
	protected _fileWatcher: FileWatcher;
	protected _hash: Hash = createHash("ripemd160");
	protected _state: State = {
		position: POSITION.BEFORE_PREAMBLE,
		outerCase: null,
		outerJob: null,
	};

	public constructor(pathLike: PathLike) {
		super();

		// 16*1024 is the MAX_LENGTH for strings
		this._circularBuffer = new CircularBuffer(16 * 1024 * 2, (buffer) => {
			this._read(buffer);
		});

		this._fileReadingService = new FileReadingService(
			pathLike,
			this._circularBuffer,
		);

		this._fileWatcher = new FileWatcher(pathLike, () => {
			this._fileReadingService.onFileChanged();
		});
	}

	public async initialize() {
		const byteLength = getByteLength(this._state);

		this._circularBuffer.requireByteLength(byteLength);

		await this._fileReadingService.open();

		this._fileWatcher.watch();
	}

	protected _read(buffer: Buffer) {
		const stateRecipe = read(buffer, this._state);

		if ("event" in stateRecipe && stateRecipe.event === "error") {
			this._fileWatcher.close();
			this._fileReadingService
				.close()
				.then(() => {
					this.emit("error", stateRecipe.error);
				})
				.catch((error) => {
					this.emit(
						"error",
						error instanceof Error
							? error
							: new Error("Could not close the FileReadingService"),
					);
				});

			return;
		}

		if ("event" in stateRecipe && stateRecipe.event === "end") {
			this._fileWatcher.close();
			this._fileReadingService
				.close()
				.then(() => {
					const hashDigest = this._hash.digest();

					if (Buffer.compare(stateRecipe.hashDigest, hashDigest) !== 0) {
						this.emit(
							"error",
							new Error(
								"The read data hash of does not match the calculated one",
							),
						);
					} else {
						this.emit("finish");
					}
				})
				.catch((error) => {
					this.emit(
						"error",
						error instanceof Error
							? error
							: new Error("Could not close the FileReadingService"),
					);
				});

			return;
		}

		if ("event" in stateRecipe && stateRecipe.event === "case") {
			this.emit("case", stateRecipe.surfaceAgnosticCase);
		}

		if ("event" in stateRecipe && stateRecipe.event === "job") {
			this.emit("job", stateRecipe.surfaceAgnosticJob);
		}

		if (
			this._state.position !== POSITION.BEFORE_PREAMBLE &&
			this._state.position !== POSITION.BEFORE_POSTAMBLE_HASH_DIGEST &&
			stateRecipe.position !== POSITION.BEFORE_POSTAMBLE_HASH_DIGEST
		) {
			this._hash.update(buffer);
		}

		this._state = {
			position: stateRecipe.position,
			outerCase: stateRecipe.outerCase,
			outerJob: stateRecipe.outerJob,
		};

		const byteLength = getByteLength(this._state);

		this._circularBuffer.requireByteLength(byteLength);
	}
}
