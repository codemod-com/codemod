import { CleanOptions, simpleGit } from "simple-git";
import { invariant } from "ts-invariant";
import { cwdContext } from "../contexts.js";
import { isDirectory } from "../fs.js";
import { logger } from "../helpers.js";

/**
 * Get the default branch from a remote repository
 */
export const getDefaultBranchFromRemote = async (repository: string) => {
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
}: {
  cwd: string;
  hash: string;
  branch: string;
}) => {
  const localHash = await simpleGit(cwd).revparse("HEAD");
  if (localHash !== hash) {
    await simpleGit(cwd).pull("origin", branch);
  }
};

export const syncForkRepository = async (
  key: string,
  {
    branch,
    upstream,
    fork,
  }: { branch?: string; upstream: string; fork: string },
) => {
  const cwd = cwdContext.getStore();
  invariant(cwd, "No cwd found");
  const git = simpleGit(cwd.cwd);
  const remoteDefaultBranch = await getDefaultBranchFromRemote(upstream);
  invariant(
    remoteDefaultBranch,
    `No remote default branch found in ${upstream}`,
  );
  const remoteDefaultBranchHashes = await Promise.all([
    getBranchHashFromRemote(upstream, remoteDefaultBranch),
    getBranchHashFromRemote(fork, remoteDefaultBranch),
  ]);
  if (remoteDefaultBranchHashes[0] !== remoteDefaultBranchHashes[1]) {
    const log = logger("Syncing forked repository");
    try {
      if (
        !(await git.getRemotes()).some((remote) => remote.name === "upstream")
      ) {
        await git.addRemote("upstream", upstream);
      }
      await git.fetch("upstream", remoteDefaultBranch);
      await git.checkout(branch || remoteDefaultBranch);
      await git.mergeFromTo(
        `upstream/${remoteDefaultBranch}`,
        branch || remoteDefaultBranch,
      );
      await git.push("origin", branch || remoteDefaultBranch);
      log.success();
    } catch (error: any) {
      log.fail(error.toString());
    }
  }
};

export const cloneRepository = async (
  key: string,
  {
    repositoryUrl,
    extraName,
    shallow,
    branch,
    tmpDir,
  }: {
    repositoryUrl: string;
    extraName?: string;
    shallow?: boolean;
    branch?: string;
    tmpDir: string;
  },
) => {
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
      await git.deleteLocalBranches(localBranches, true);
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
