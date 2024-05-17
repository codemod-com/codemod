import type { Uri } from 'vscode';
import type { FileService } from '../components/fileService';
import { type Job, JobKind } from './types';

export let acceptJobs = async (
	fileService: FileService,
	jobs: ReadonlyArray<Job>,
) => {
	let createJobOutputs: [Uri, Uri][] = [];
	let updateJobOutputs: [Uri, Uri][] = [];
	let deleteJobOutputs: Uri[] = [];
	let moveJobOutputs: [Uri, Uri, Uri][] = [];

	for (let job of jobs) {
		if (
			job.kind === JobKind.createFile &&
			job.newUri &&
			job.newContentUri
		) {
			createJobOutputs.push([job.newUri, job.newContentUri]);
		}

		if (job.kind === JobKind.deleteFile && job.oldUri) {
			deleteJobOutputs.push(job.oldUri);
		}

		if (
			(job.kind === JobKind.moveAndRewriteFile ||
				job.kind === JobKind.moveFile) &&
			job.oldUri &&
			job.newUri &&
			job.newContentUri
		) {
			moveJobOutputs.push([job.oldUri, job.newUri, job.newContentUri]);
		}

		if (
			job.kind === JobKind.rewriteFile &&
			job.oldUri &&
			job.newContentUri
		) {
			updateJobOutputs.push([job.oldUri, job.newContentUri]);
		}

		if (job.kind === JobKind.copyFile && job.newUri && job.newContentUri) {
			createJobOutputs.push([job.newUri, job.newContentUri]);
		}
	}

	for (let createJobOutput of createJobOutputs) {
		let [newUri, newContentUri] = createJobOutput;
		await fileService.createFile({
			newUri,
			newContentUri,
		});
	}

	for (let updateJobOutput of updateJobOutputs) {
		let [uri, contentUri] = updateJobOutput;
		await fileService.updateFile({
			uri,
			contentUri,
		});
	}

	for (let moveJobOutput of moveJobOutputs) {
		let [oldUri, newUri, newContentUri] = moveJobOutput;
		await fileService.moveFile({
			oldUri,
			newUri,
			newContentUri,
		});
	}

	await fileService.deleteFiles({
		uris: deleteJobOutputs.slice(),
	});
};
