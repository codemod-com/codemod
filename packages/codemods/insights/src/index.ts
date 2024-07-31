import type { Api } from "@codemod.com/workflow";

import { memoize } from "./cache-utils.js";
import {
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils.js";

import { getPackagesData } from './package.js';
import { getAllCommits, getCommitsWithInterval, runForEachCommit } from './commits.js';
import { runAnalysis, type Result } from "./analysis/libyearAnalysis.js";

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

  return packageRegistryData ? runAnalysis(
    packageName,
    packageVersionRange,
    normalizePackageRegistryData(packageRegistryData),
  ) : null;
};

const getCommitsToCheck = async (exec: (...args: any[]) => Promise<string>) => {
  const commits = await getAllCommits(exec);
  const intervalDuration = (commits.at(0)?.date.getTime() - commits.at(-1)?.date.getTime()) / COMMITS_COUNT;
  return await getCommitsWithInterval(commits, intervalDuration);
};

const getGlobalResults = (packagesResults: Result[]) => {
  const globalResult = packagesResults.at(0);

  for (const result of packagesResults) {
    for (const { name, value } of (result ?? [])) {

      const foundMetric = globalResult?.find(metric => metric.name === name);

      if (!foundMetric) {
        continue;
      }

      foundMetric.value += Number(value);
    }
  }

  return globalResult;
}

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
        getPackagesData(packageJson, { ...options, ...(pnpmWorkspace && { pnpmWorkspace }) })
          .map(({ packageName, packageVersionRange }) => analyzePackage(packageName, packageVersionRange))
      );

      console.log(getPackagesData(packageJson, { ...options, ...(pnpmWorkspace && { pnpmWorkspace }) }), packagesResults, 'HERE???');

      return getGlobalResults(packagesResults.filter(Boolean));
    };


const getAnalyzeWorkspace =
  (options: Options) =>
    async ({ getContents }) => {
      const pnpmWorkspace = await getContents();
      // @TODO

      return pnpmWorkspace;
    };

export async function workflow({ git }: Api, options: Options) {
  const analysis = [];

  await git.clone(options.repo, async ({ files, exec }) => {
    const commits = await getCommitsToCheck(exec);

    await runForEachCommit(commits, exec, async ({ date }) => {
      // workspace 
      const [workspace] = await files(PNPM_WORKSPACE_PATH)
        .yaml()
        .map<any, any>(getAnalyzeWorkspace(options));

      // libyear
      const packagesAnalysis = await files(`**/apps/**/package.json`)
        .json()
        .map<any, any>(getAnalyzePackageJson(options, workspace));


      const commitAnalysis = packagesAnalysis.map(
        (data) => ({
          ...data,
          timestamp: date,
          label: options.label,
        }),
      );

      analysis.push(...commitAnalysis);
    });

  });

  return analysis;
}
