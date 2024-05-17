import { createHash, randomBytes } from 'node:crypto';
import { open, rm } from 'node:fs/promises';
import { afterAll, describe, expect, it } from 'vitest';
import type { SurfaceAgnosticCase } from '../../schemata/surfaceAgnosticCaseSchema.js';
import {
	JOB_KIND,
	type SurfaceAgnosticJob,
} from '../../schemata/surfaceAgnosticJobSchema.js';
import { CaseReadingService } from './caseReadingService.js';
import {
	CaseWritingService,
	serializeCase,
	serializeJob,
	serializePostamble,
	serializePreamble,
} from './caseWritingService.js';

describe('CaseWritingService', () => {
	let caseHashDigest = randomBytes(20);
	let codemodHashDigest = randomBytes(20);

	let kase: SurfaceAgnosticCase = {
		caseHashDigest: caseHashDigest.toString('base64url'),
		codemodHashDigest: codemodHashDigest.toString('base64url'),
		createdAt: BigInt(Date.now()),
		absoluteTargetPath: '/a/b/c',
		argumentRecord: {
			a: '1',
			b: 2,
			c: false,
		},
	};

	let fileCreationJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.CREATE_FILE,
		pathUri: randomBytes(10).toString('base64url'),
		dataUri: randomBytes(10).toString('base64url'),
	};

	let fileUpdatingJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.UPDATE_FILE,
		pathUri: randomBytes(10).toString('base64url'),
		newDataUri: randomBytes(10).toString('base64url'),
	};

	let fileMovingJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.MOVE_FILE,
		oldPathUri: randomBytes(10).toString('base64url'),
		newPathUri: randomBytes(10).toString('base64url'),
	};

	let fileMovingAndUpdatingJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.MOVE_AND_UPDATE_FILE,
		oldPathUri: randomBytes(10).toString('base64url'),
		newPathUri: randomBytes(10).toString('base64url'),
		newDataUri: randomBytes(10).toString('base64url'),
	};

	let fileDeletionJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.DELETE_FILE,
		pathUri: randomBytes(10).toString('base64url'),
	};

	let fileCopyingJob: SurfaceAgnosticJob = {
		jobHashDigest: randomBytes(20).toString('base64url'),
		kind: JOB_KIND.COPY_FILE,
		sourcePathUri: randomBytes(10).toString('base64url'),
		targetPathUri: randomBytes(10).toString('base64url'),
	};

	let pathLike = `./${randomBytes(20).toString('base64url')}.data`;

	afterAll(() => rm(pathLike, { force: true }));

	it('should write the case', async () => {
		let writingFileHandle = await open(pathLike, 'w');

		try {
			let service = new CaseWritingService(writingFileHandle);

			await new Promise<void>((resolve, reject) => {
				service.once('error', (error) => {
					reject(error);
				});

				service.once('finish', () => {
					resolve();
				});

				service
					.writeCase(kase)
					.then(() => service.writeJob(fileCreationJob))
					.then(() => service.writeJob(fileUpdatingJob))
					.then(() => service.writeJob(fileMovingJob))
					.then(() => service.writeJob(fileMovingAndUpdatingJob))
					.then(() => service.writeJob(fileDeletionJob))
					.then(() => service.writeJob(fileCopyingJob))
					.then(() => service.finish())
					.catch((error) => {
						reject(error);
					});
			});

			let fileHandle = await open(pathLike, 'r');

			let buffer = fileHandle.readFile();

			expect((await buffer).length).toEqual(615);
		} finally {
			await rm(pathLike, { force: true });
		}
	});

	it('should write the case into a buffer', () => {
		let buffers: Buffer[] = [];
		let hash = createHash('ripemd160');

		let push = (buffer: Buffer) => {
			buffers.push(buffer);
			hash.update(buffer);
		};

		push(serializePreamble());
		push(serializeCase(kase));
		push(serializeJob(fileCreationJob));
		push(serializeJob(fileUpdatingJob));
		push(serializeJob(fileMovingJob));
		push(serializeJob(fileMovingAndUpdatingJob));
		push(serializeJob(fileDeletionJob));
		push(serializeJob(fileCopyingJob));

		buffers.push(serializePostamble(hash.digest()));

		let buffer = Buffer.concat(buffers);

		expect(buffer.length).toEqual(615);
	});

	it('x', async () => {
		let pathLike = `./${randomBytes(20).toString('base64url')}.data`;

		let fileHandle = await open(pathLike, 'w');

		let service = new CaseReadingService(pathLike);

		let actualKase: SurfaceAgnosticCase | null = null;
		let jobs: SurfaceAgnosticJob[] = [];

		service.once('case', (k) => {
			actualKase = k;
		});

		service.on('job', (j) => {
			jobs?.push(j);
		});

		try {
			await service.initialize();

			let hash = createHash('ripemd160');

			await new Promise<void>((resolve, reject) => {
				service.once('error', (error) => {
					reject(error);
				});

				service.once('finish', () => {
					resolve();
				});

				let preamble = serializePreamble();

				let serializedCase = serializeCase(kase);
				hash.update(serializedCase);

				let serializedJobs: Buffer[] = [];

				let pushJob = (job: Buffer) => {
					serializedJobs.push(job);
					hash.update(job);
				};

				pushJob(serializeJob(fileCreationJob));
				pushJob(serializeJob(fileUpdatingJob));
				pushJob(serializeJob(fileMovingJob));
				pushJob(serializeJob(fileMovingAndUpdatingJob));
				pushJob(serializeJob(fileDeletionJob));
				pushJob(serializeJob(fileCopyingJob));

				let serializedPostamble = serializePostamble(hash.digest());

				fileHandle
					.write(preamble)
					.then(() => fileHandle.write(serializedCase))
					.then(() => fileHandle.write(serializedJobs[0]!))
					.then(() => fileHandle.write(serializedJobs[1]!))
					.then(() => fileHandle.write(serializedJobs[2]!))
					.then(() => fileHandle.write(serializedJobs[3]!))
					.then(() => fileHandle.write(serializedJobs[4]!))
					.then(() => fileHandle.write(serializedJobs[5]!))
					.then(() => fileHandle.write(serializedPostamble))
					.catch((error) => {
						reject(error);
					});
			});

			expect(actualKase).toStrictEqual(kase);
		} finally {
			await rm(pathLike, { force: true });
		}
	});
});
