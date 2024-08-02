import { type Api, api } from "@codemod.com/workflow";

import { memoize } from "./cache-utils.js";
import {
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils.js";

import { writeFileSync } from "node:fs";
import { type Result, runAnalysis } from "./analysis/libyearAnalysis.js";
import { type CommitData, getCommitsWithInterval } from "./commits.js";
import { getPackagesData } from "./package.js";

// default pnpm workspace file path
const PNPM_WORKSPACE_PATH = "./pnpm-workspace.yaml";
// count of commits to process in the analysis
const COMMITS_COUNT = 20;

type Options = {
  repo: string;
  onlyProd: boolean;
  label: string;
  targets?: string[];
};

type PnpmWorkspace = {
  catalog?: Record<string, string>;
};

const memoizedGetPackageRegistryData = memoize(getPackageRegistryData);

const analyzePackage = async (
  packageName: string,
  packageVersionRange: string,
  date: Date,
) => {
  console.info(`Analyzing package: ${packageName}`);
  const packageRegistryData = await memoizedGetPackageRegistryData(packageName);

  return packageRegistryData
    ? runAnalysis(
        packageName,
        packageVersionRange,
        normalizePackageRegistryData(packageRegistryData),
        date,
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
  (options: Options, pnpmWorkspace: PnpmWorkspace | null, date: Date) =>
  async ({
    getContents,
  }: { getContents(): Promise<Record<string, string>> }) => {
    const packageJson = await getContents();

    if (!options.targets?.includes(packageJson.name ?? "")) {
      return null;
    }

    console.log(`-----------Analyzing ${packageJson.name}-----------`);

    const packagesResults = await Promise.all(
      getPackagesData(packageJson, {
        ...options,
        ...(pnpmWorkspace && { pnpmWorkspace }),
      }).map(({ packageName, packageVersionRange }) =>
        analyzePackage(packageName, packageVersionRange, date),
      ),
    );

    console.log(`Packages drift: ${JSON.stringify(packagesResults, null, 2)}`);

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
  repo: "https://github.com/netlify/netlify-react-ui.git",
  onlyProd: true,
  label: "real_drift",
  targets: ["netlify-react-ui", "@netlify/source"],
};

export async function workflow({ git, contexts }: Api) {
  const analysis: Result[] = [];

  await git.clone(
    {
      repository: options.repo,
      shallow: false,
    },
    async ({ files }) => {
      const { all: allCommits } = await contexts
        .getGitContext()
        .simpleGit.log();
      const commits = await getCommitsToCheck(
        allCommits.map(({ hash, date }) => ({
          commit: hash,
          date: new Date(date),
        })),
      );

      for (const { commit, date } of commits) {
        await contexts.getGitContext().simpleGit.checkout(commit);
        // workspace
        const [workspace] = await files(PNPM_WORKSPACE_PATH)
          .yaml()
          .map<any, any>(getAnalyzeWorkspace(options));

        // libyear
        const packagesAnalysis = await files(`**/package.json`)
          .json()
          .map<any, Result>(getAnalyzePackageJson(options, workspace, date));

        const commitAnalysis = packagesAnalysis.filter(Boolean).map((data) => ({
          ...data,
          timestamp: date,
          label: options.label,
        }));

        analysis.push(...commitAnalysis);
      }
    },
  );

  writeFileSync("./workflow.json", JSON.stringify(analysis, null, 2));
  return analysis;
}

workflow(api);
