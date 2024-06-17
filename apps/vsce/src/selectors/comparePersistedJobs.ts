import { Uri } from 'vscode';
import { type Job, JobKind, type PersistedJob } from '../jobs/types';

export let doesJobAddNewFile = (kind: Job['kind']): boolean => {
	return [
		JobKind.copyFile,
		JobKind.createFile,
		JobKind.moveAndRewriteFile,
		JobKind.moveFile,
	].includes(kind);
};

export let getPersistedJobUri = (job: PersistedJob): Uri | null => {
	if (doesJobAddNewFile(job.kind) && job.newUri !== null) {
		return Uri.parse(job.newUri);
	}

	if (!doesJobAddNewFile(job.kind) && job.oldUri !== null) {
		return Uri.parse(job.oldUri);
	}

	return null;
};

export let comparePersistedJobs = (a: PersistedJob, b: PersistedJob) => {
	let aUri = getPersistedJobUri(a);
	let bUri = getPersistedJobUri(b);

	if (aUri === null || bUri === null) {
		return 0;
	}

	return aUri.fsPath.localeCompare(bUri.fsPath);
};
