import * as t from 'io-ts';
import { Uri } from 'vscode';
import type { CaseHash } from '../cases/types';
import { caseHashCodec } from '../cases/types';
import { buildTypeCodec } from '../utilities';

interface JobHashBrand {
	readonly __JobHash: unique symbol;
}

export const jobHashCodec = t.brand(
	t.string,
	(hashDigest): hashDigest is t.Branded<string, JobHashBrand> =>
		hashDigest.length > 0,
	'__JobHash',
);

export type JobHash = t.TypeOf<typeof jobHashCodec>;

export const enum JobKind {
	rewriteFile = 1,
	createFile = 2,
	deleteFile = 3,
	moveFile = 4,
	moveAndRewriteFile = 5,
	copyFile = 6,
}

export type Job = Readonly<{
	hash: JobHash;
	kind: JobKind;
	oldUri: Uri | null;
	newUri: Uri | null;
	newContentUri: Uri | null;
	originalNewContent: string | null;
	codemodName: string;
	createdAt: number;
	caseHashDigest: CaseHash;
}>;

export const persistedJobCodec = buildTypeCodec({
	hash: jobHashCodec,
	kind: t.union([
		t.literal(JobKind.rewriteFile),
		t.literal(JobKind.createFile),
		t.literal(JobKind.deleteFile),
		t.literal(JobKind.moveAndRewriteFile),
		t.literal(JobKind.moveFile),
		t.literal(JobKind.copyFile),
	]),
	oldUri: t.union([t.string, t.null]),
	newUri: t.union([t.string, t.null]),
	newContentUri: t.union([t.string, t.null]),
	originalNewContent: t.union([t.string, t.null]),
	codemodName: t.string,
	caseHashDigest: caseHashCodec,
	createdAt: t.number,
});

export type PersistedJob = t.TypeOf<typeof persistedJobCodec>;

export const mapJobToPersistedJob = (job: Job): PersistedJob => {
	return {
		...job,
		oldUri: job.oldUri?.toString() ?? null,
		newUri: job.newUri?.toString() ?? null,
		newContentUri: job.newContentUri?.toString() ?? null,
		originalNewContent: job.originalNewContent,
	};
};

export const mapPersistedJobToJob = (persistedJob: PersistedJob): Job => {
	return {
		...persistedJob,
		oldUri: persistedJob.oldUri ? Uri.parse(persistedJob.oldUri) : null,
		newUri: persistedJob.newUri ? Uri.parse(persistedJob.newUri) : null,
		newContentUri: persistedJob.newContentUri
			? Uri.parse(persistedJob.newContentUri)
			: null,
		originalNewContent: persistedJob.originalNewContent,
	};
};
