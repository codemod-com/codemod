import { Uri } from 'vscode';
import type { Job, PersistedJob } from '../jobs/types';
import { JobKind } from '../jobs/types';

export const doesJobAddNewFile = (kind: Job['kind']): boolean => {
	return [
		JobKind.copyFile,
		JobKind.createFile,
		JobKind.moveAndRewriteFile,
		JobKind.moveFile,
	].includes(kind);
};

export const getPersistedJobUri = (job: PersistedJob): Uri | null => {
	if (doesJobAddNewFile(job.kind) && job.newUri !== null) {
		return Uri.parse(job.newUri);
	}

	if (!doesJobAddNewFile(job.kind) && job.oldUri !== null) {
		return Uri.parse(job.oldUri);
	}

	return null;
};

export const comparePersistedJobs = (a: PersistedJob, b: PersistedJob) => {
	const aUri = getPersistedJobUri(a);
	const bUri = getPersistedJobUri(b);

	if (aUri === null || bUri === null) {
		return 0;
	}

	return aUri.fsPath.localeCompare(bUri.fsPath);
};
