import { invariant } from "ts-invariant";
import { cwdContext, getCwdContext, repositoryContext } from "./contexts.js";
import { getTmpDir, isDirectory } from "./fs";
import { clc, logger } from "./helpers";
import { spawn } from "./spawn";

const getDefaultBranchFromRemote = async (repository: string) => {
  const { stdout } = await spawn(
    "git",
    ["ls-remote", "--symref", repository, "HEAD"],
    { doNotThrowError: true },
  );
  return stdout.join("").match(/refs\/heads\/(\S+)/m)?.[1];
};

const getBranchHashFromRemote = async (
  repositoryUrl: string,
  branch: string,
) => {
  const { stdout } = await spawn("git", ["ls-remote", repositoryUrl, branch], {
    doNotThrowError: true,
  });
  return stdout.join("").split("\t")[0];
};

const checkoutBranch = async (dir: string, branch: string) => {
  const response = await spawn("git", ["checkout", branch], {
    cwd: dir,
    doNotThrowError: true,
  });
  const stderr = response.stderr.join("").trim();
  if (stderr.match(/did not match any file/)) {
    console.warn(
      `${clc.yellow("WARN")} Branch ${JSON.stringify(branch)} does not exist`,
    );
    await spawn("git", ["checkout", "-b", branch], {
      cwd: dir,
    });
  }
};

export const switchBranch = async (branchName: string) => {
  const repoContext = repositoryContext.getStore();
  invariant(repoContext, "No repository context found");
  const cwdContext = getCwdContext();

  await checkoutBranch(cwdContext.cwd, branchName);

  const newBranch = await gitBranch(cwdContext.cwd);

  repoContext.branch = newBranch;
  const log = logger(
    `Creating branch: ${repoContext.repository}/tree/${branchName}`,
  );
  log.success();
};

const gitBranch = async (dir: string) => {
  const { stdout } = await spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: dir,
  });
  const branch = stdout.join("").trim();
  return branch;
};

export const cloneRepository = async (
  repositoryUrl: string,
  extraName?: string,
) => {
  const tmpDir = await getTmpDir(
    `${repositoryUrl}${extraName ? `-${extraName}` : ""}`,
  );
  const cwd = cwdContext.getStore();
  if (cwd) {
    cwd.cwd = tmpDir;
  }

  if (await isDirectory(tmpDir)) {
    console.log(`Directory ${tmpDir} already exists, skipping clone`);
    const remoteDefaultBranch = await getDefaultBranchFromRemote(repositoryUrl);
    const remoteDefaultBranchHash =
      remoteDefaultBranch &&
      (await getBranchHashFromRemote(repositoryUrl, remoteDefaultBranch));
    invariant(
      remoteDefaultBranchHash,
      `No remote default branch hash found in remote ${repositoryUrl}`,
    );
    return remoteDefaultBranch;
  }

  const log = logger(`Cloning repository: ${repositoryUrl} to ${tmpDir}`);
  await spawn("git", ["clone", repositoryUrl, tmpDir]);
  const branch = await gitBranch(tmpDir);
  log.success();
  return branch;
};
