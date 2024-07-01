import { CleanOptions, simpleGit } from "simple-git";
import { invariant } from "ts-invariant";
import { cwdContext, parentCwdContext } from "../contexts.js";
import { getTmpDir, isDirectory } from "../fs.js";
import { logger } from "../helpers.js";

/**
 * Get the default branch from a remote repository
 */
const getDefaultBranchFromRemote = async (repository: string) => {
  const stdout = await simpleGit().listRemote(["--symref", repository, "HEAD"]);
  return stdout.match(/refs\/heads\/(\S+)/m)?.[1];
};

/**
 * Get the hash of a branch from a remote repository
 */
const getBranchHashFromRemote = async (
  repositoryUrl: string,
  branch: string,
) => {
  const stdout = await simpleGit().listRemote([repositoryUrl, branch]);
  return stdout.split("\t")[0];
};

const ensureBranchHash = async ({
  cwd,
  hash,
  branch,
}: { cwd: string; hash: string; branch: string }) => {
  const localHash = await simpleGit(cwd).revparse("HEAD");
  if (localHash !== hash) {
    await simpleGit(cwd).pull("origin", branch);
  }
};

export const cloneRepository = async (
  key: string,
  {
    repositoryUrl,
    extraName,
    shallow,
    branch,
  }: {
    repositoryUrl: string;
    extraName?: string;
    shallow?: boolean;
    branch?: string;
  },
) => {
  const tmpDir = getTmpDir(
    `${repositoryUrl}${extraName ? `-${extraName}` : ""}`,
  );
  const cwd = cwdContext.getStore();
  const parentCwd = parentCwdContext.getStore();
  if (cwd) {
    cwd.cwd = tmpDir;
  }
  if (parentCwd) {
    parentCwd.cwd = tmpDir;
  }

  if (await isDirectory(tmpDir)) {
    const git = simpleGit(tmpDir);
    console.log(`Directory ${tmpDir} already exists, skipping clone`);
    await git.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE);
    await git.reset(["--hard"]);
    const remoteDefaultBranch = await getDefaultBranchFromRemote(repositoryUrl);
    invariant(
      remoteDefaultBranch,
      `No remote default branch found in ${repositoryUrl}`,
    );
    await git.checkout(remoteDefaultBranch);
    const remoteDefaultBranchHash =
      remoteDefaultBranch &&
      (await getBranchHashFromRemote(repositoryUrl, remoteDefaultBranch));
    invariant(
      remoteDefaultBranchHash,
      `No remote default branch hash found in remote ${repositoryUrl}`,
    );
    await ensureBranchHash({
      cwd: tmpDir,
      hash: remoteDefaultBranchHash,
      branch: remoteDefaultBranch,
    });

    const localBranches = (await git.branchLocal()).all.filter(
      (branchName) => branchName !== remoteDefaultBranch,
    );
    if (localBranches.length) {
      await git.deleteLocalBranches(localBranches);
    }
    return;
  }

  const log = logger(`Cloning repository: ${repositoryUrl} to ${tmpDir}`);
  await simpleGit().clone(
    repositoryUrl,
    tmpDir,
    shallow
      ? [
          "--depth",
          "1",
          "--single-branch",
          ...(branch ? [`--branch=${branch}`] : []),
        ]
      : [],
  );
  log.success();
};
