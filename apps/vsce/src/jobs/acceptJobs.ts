import type { Uri } from "vscode";
import type { FileService } from "../components/fileService";
import { type Job, JobKind } from "./types";

export const acceptJobs = async (
  fileService: FileService,
  jobs: ReadonlyArray<Job>,
) => {
  const createJobOutputs: [Uri, Uri][] = [];
  const updateJobOutputs: [Uri, Uri][] = [];
  const deleteJobOutputs: Uri[] = [];
  const moveJobOutputs: [Uri, Uri, Uri][] = [];

  for (const job of jobs) {
    if (job.kind === JobKind.createFile && job.newUri && job.newContentUri) {
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

    if (job.kind === JobKind.rewriteFile && job.oldUri && job.newContentUri) {
      updateJobOutputs.push([job.oldUri, job.newContentUri]);
    }

    if (job.kind === JobKind.copyFile && job.newUri && job.newContentUri) {
      createJobOutputs.push([job.newUri, job.newContentUri]);
    }
  }

  for (const createJobOutput of createJobOutputs) {
    const [newUri, newContentUri] = createJobOutput;
    await fileService.createFile({
      newUri,
      newContentUri,
    });
  }

  for (const updateJobOutput of updateJobOutputs) {
    const [uri, contentUri] = updateJobOutput;
    await fileService.updateFile({
      uri,
      contentUri,
    });
  }

  for (const moveJobOutput of moveJobOutputs) {
    const [oldUri, newUri, newContentUri] = moveJobOutput;
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
