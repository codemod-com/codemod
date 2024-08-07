import type { Api } from "@codemod.com/workflow";

import { memoize } from "./cache-utils.js";
import {
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils.js";

import { type Result, runAnalysis } from "./analysis/libyearAnalysis.js";
import {
  type CommitData,
  getCommitsWithInterval,
  runForEachCommit,
} from "./commits.js";
import { getPackagesData } from "./package.js";

// default pnpm workspace file path
const PNPM_WORKSPACE_PATH = "./pnpm-workspace.yaml";
// count of commits to process in the analysis
const COMMITS_COUNT = 10;

type Options = {
  repo: string;
  onlyProd: boolean;
  label: string;
};

type PnpmWorkspace = {
  catalog?: Record<string, string>;
};

const memoizedGetPackageRegistryData = memoize(getPackageRegistryData);

const analyzePackage = async (
  packageName: string,
  packageVersionRange: string,
) => {
  const packageRegistryData = await memoizedGetPackageRegistryData(packageName);

  return packageRegistryData
    ? runAnalysis(
        packageName,
        packageVersionRange,
        normalizePackageRegistryData(packageRegistryData),
      )
    : null;
};

const getCommitsIntervalDuration = (commits: CommitData[]): number | null => {
  const lastCommitTime = commits.at(0)?.date.getTime();
  const firstCommitTime = commits.at(-1)?.date.getTime();

  if (!lastCommitTime || !firstCommitTime) {
    return null;
  }

  return (lastCommitTime - firstCommitTime) / COMMITS_COUNT;
};

const getCommitsWithDistance = (commits: CommitData[], distance: number) => {
  const selectedCommits: CommitData[] = [];

  for (let i = 0; i < commits.length; i += distance) {
    const commit = commits[i];

    if (commit) {
      selectedCommits.push();
    }
  }

  return selectedCommits;
};

// get COMMIT_COUNT of codemods evenly distributed in time
const getCommitsToCheck = (commits: CommitData[]) => {
  const intervalDuration = getCommitsIntervalDuration(commits);
  return intervalDuration
    ? getCommitsWithInterval(commits, intervalDuration)
    : getCommitsWithDistance(
        commits,
        Math.floor(commits.length / COMMITS_COUNT),
      );
};

const getGlobalResults = (packagesResults: Result[], name: string) => {
  return packagesResults.reduce(
    (acc, item) => {
      Object.keys(item).forEach((key) => {
        if (typeof item[key] === "number") {
          if (!acc[key]) {
            acc[key] = 0;
          }

          acc[key] += item[key];
        }
      });

      return acc;
    },
    { name },
  );
};

/**
 * Generates analysis for given package.json
 */
const getAnalyzePackageJson =
  (options: Options, pnpmWorkspace?: PnpmWorkspace | null) =>
  async ({
    getContents,
  }: { getContents(): Promise<Record<string, string>> }) => {
    const packageJson = await getContents();

    const packagesResults = await Promise.all(
      getPackagesData(packageJson, {
        ...options,
        ...(pnpmWorkspace && { pnpmWorkspace }),
      }).map(({ packageName, packageVersionRange }) =>
        analyzePackage(packageName, packageVersionRange),
      ),
    );

    return getGlobalResults(
      packagesResults.filter((packageResult): packageResult is Result =>
        Boolean(packageResult),
      ),
      packageJson.name ?? "Unnamed",
    );
  };

const getAnalyzeWorkspace =
  (options: Options) =>
  async ({
    getContents,
  }: { getContents(): Promise<Record<string, string>> }) => {
    const pnpmWorkspace = await getContents();
    // @TODO

    return pnpmWorkspace;
  };

const options = {
  repo: "https://github.com/DmytroHryshyn/feature-flag-example.git",
  onlyProd: false,
  label: "real_drift",
};

export async function workflow({ git, contexts }: Api) {
  const analysis: Result[] = [];

  await git.clone(options.repo, async ({ files, exec }) => {
    const { all: allCommits } = await contexts.getGitContext().simpleGit.log();
    const commits = await getCommitsToCheck(
      allCommits.map(({ hash, date }) => ({
        commit: hash,
        date: new Date(date),
      })),
    );

    await runForEachCommit(commits, exec, async ({ date }) => {
      // workspace
      const [workspace] = await files(PNPM_WORKSPACE_PATH)
        .yaml()
        .map<any, any>(getAnalyzeWorkspace(options));

      // libyear
      const packagesAnalysis = await files(`**/package.json`)
        .json()
        .map<any, Result>(getAnalyzePackageJson(options, workspace));

      const commitAnalysis = packagesAnalysis.map((data) => ({
        ...data,
        timestamp: date,
        label: options.label,
      }));

      analysis.push(...commitAnalysis);
    });
  });

  return analysis;
}
