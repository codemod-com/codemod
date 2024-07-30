import type { Api } from "@codemod.com/workflow";

import semver from "semver";
import { memoize } from "./cache-utils.js";
import {
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils.js";

import { getPackages } from './package.js';
import { getAllCommits, getCommitsWithInterval } from './commits.js';
import { runAnalysis } from "./libyearAnalysis.js";

// default pnpm workspace file path
const PNPM_WORKSPACE_PATH = "./pnpm-workspace.yaml";
// count of commits to process in the analysis
const COMMITS_COUNT = 10;

type Options = {
  repos: string[];
  onlyProd: boolean;
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

/**
 * Generates analysis for given package.json
 */
const getAnalyzePackageJson =
  (options: Options, pnpmWorkspace?: PnpmWorkspace | null) =>
    async ({
      getContents,
    }: { getContents(): Promise<Record<string, string>> }) => {
      const packageJson = await getContents();

      const getPackageCatalogVersionRange = (packageData: { packageName: string, packageVersionRange: string | null }) => packageData.packageVersionRange === 'catalog:' ? ({ ...packageData, packageVersionRange: pnpmWorkspace?.catalog?.[packageData.packageName] }) : packageData;
      const isValidVersionRange = ({ packageVersionRange }: { packageName: string, packageVersionRange?: string | null }) => packageVersionRange !== null && semver.validRange(packageVersionRange);

      const packagesAnalysis = await Promise.all(
        getPackages(packageJson, options)
          .map(getPackageCatalogVersionRange)
          .filter(isValidVersionRange)
          .map(({ packageName, packageVersionRange }) => analyzePackage(packageName, packageVersionRange)));


      return packagesAnalysis.filter(Boolean).reduce(
        (acc, pkg) => {
          if (pkg?.drift) {
            acc.drift += pkg.drift;
          }

          return acc;
        },
        {
          drift: 0,
          package: packageJson.name,
        },
      );
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

  await git.clone(options.repos, async ({ files, exec }) => {
    const commits = await getCommitsToCheck(exec);

    for (const { commit, date } of commits) {
      await exec(`git checkout ${commit}`);

      const [workspace] = await files(PNPM_WORKSPACE_PATH)
        .yaml()
        .map<any, any>(getAnalyzeWorkspace(options));

      const packagesAnalysis = await files(`**/apps/**/package.json`)
        .json()
        .map<any, any>(getAnalyzePackageJson(options, workspace));

      const commitAnalysis = packagesAnalysis.map(
        ({ drift, package: packageName }) => ({
          timestamp: date,
          value: drift,
          // app/package within monorepo
          package: packageName,
          kind: "real_drift",
        }),
      );

      analysis.push(...commitAnalysis);
    }
  });

  console.log(JSON.stringify(analysis));

  return analysis;
}
