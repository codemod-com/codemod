import { CodemodRunnerService } from "../services/CodemodRunner";
import { FileSystemService } from "../services/FileSystem";
import { GithubProviderService } from "../services/GithubProvider";

import { redis } from "../services/Redis";

export type CodemodMetadata = {
  jobId: string;
  token: string;
  codemodName: string;
  codemodSource: string;
  codemodEngine: string;
  repoUrl: string;
};

export async function runCodemodJob(
  codemodMetadata: CodemodMetadata,
): Promise<void> {
  try {
    redis.codemodMetadata = codemodMetadata;

    console.log("[status]: waiting for execution to start");

    await redis.set({
      status: "progress",
      message: "waiting for execution to start",
    });

    const fs = new FileSystemService(codemodMetadata);
    await fs.createFolders();
    await fs.createSourceFile();

    const { sourcePath, targetPath } = fs;

    console.log("[status]: fetching repo");

    await redis.set({
      status: "progress",
      message: "fetching repo",
    });

    const gh = new GithubProviderService(codemodMetadata);
    await gh.cloneRepository(targetPath);
    await gh.createBranch();

    const cr = new CodemodRunnerService(sourcePath, targetPath);
    await cr.run(codemodMetadata);

    await gh.commitChanges();
    await gh.pushChanges();
    await gh.createPullRequest();

    const link = gh.pullRequestResponse?.html_url;

    console.log("[status]: codemod successfully applied");

    await redis.set({
      status: "done",
      message: `codemod successfully applied`,
      link,
    });

    await fs.deleteFolders();
  } catch (error) {
    const { message } = error as Error;

    console.error(`[error]: something went wrong ${message}`);

    await redis.set({
      status: "error",
      message: `something went wrong: ${message}`,
    });
  }
}
