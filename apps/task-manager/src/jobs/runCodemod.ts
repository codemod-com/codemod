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
  branch?: string;
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

    console.log("[status]: creating source and repo folders");

    const fs = new FileSystemService(codemodMetadata);
    await fs.createFolders();
    await fs.createSourceFile();

    const { sourcePath, targetPath } = fs;

    console.log("[status]: cloning repo");
    await redis.set({
      status: "progress",
      message: "cloning repo",
    });

    const gh = new GithubProviderService(codemodMetadata);
    await gh.cloneRepository(targetPath);
    await gh.createBranch();

    console.log("[status]: applying the codemod");

    const cr = new CodemodRunnerService(sourcePath, targetPath);
    await cr.run(codemodMetadata);

    console.log("[status]: committing and pushing changes");
    await redis.set({
      status: "progress",
      message: "committing and pushing changes",
    });

    await gh.commitChanges();
    await gh.pushChanges();

    console.log("[status]: creating a pull request");
    await redis.set({
      status: "progress",
      message: "creating a pull request",
    });

    try {
      const link = await gh.createPullRequest();
      console.log("[status]: pull request successfully created");
      await redis.set({
        status: "done",
        link,
      });
    } catch (err) {
      console.log(
        "[status]: pull request cannot be created because codemod doesn't result in any changes.",
      );
      await redis.set({
        status: "done",
        link: null,
      });
    }

    console.log("[status]: deleting source and repo folders");
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
