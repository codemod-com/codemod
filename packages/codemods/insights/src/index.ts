import type { Api } from "@codemod.com/workflow";
import { addMilliseconds, differenceInMilliseconds } from "date-fns";
import semver from "semver";
import { memoize } from "./cache-utils";
import {
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils";

import libyearAnalysis from "./libyearAnalysis.js";

type Options = {
  repos: string[];
  onlyProd: boolean;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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

  if (!packageRegistryData) {
    console.warn(
      `Unable to get package registry data for ${packageName}. Skipping`,
    );
    return null;
  }

  return libyearAnalysis(
    packageName,
    packageVersionRange,
    normalizePackageRegistryData(packageRegistryData),
  );
};

const PNPM_WORKSPACE_PATH = "./pnpm-workspace.yaml";

const getPackagesToCheck = (packageJson: PackageJson, options: Options) => {
  const depsToCheck = Object.keys(packageJson.dependencies ?? {});

  if (!options.onlyProd) {
    depsToCheck.push(...Object.keys(packageJson.devDependencies ?? {}));
  }

  return depsToCheck;
};

const getPackageVersion = (
  packageJson: PackageJson,
  packageName: string,
  workspace?: PnpmWorkspace | null,
) =>
  workspace?.catalog?.[packageName] ??
  packageJson?.dependencies?.[packageName] ??
  packageJson?.devDependencies?.[packageName] ??
  null;

const getAllCommits = async (exec: any) => {
  const command = `git log --pretty=format:"%H %ci"`;
  const result = await exec(command);

  return result.split("\n").map((line) => {
    const [commit, ...dateParts] = line.split(" ");
    return { commit, date: new Date(dateParts.join(" ")) };
  });
};

const getNSamples = async (allCommits: any[], N: number) => {
  if (allCommits.length === 0) return [];

  const totalCommits = allCommits.length;
  const firstCommitDate = allCommits[totalCommits - 1].date;
  const lastCommitDate = allCommits[0].date;

  const totalDuration = differenceInMilliseconds(
    lastCommitDate,
    firstCommitDate,
  );

  const intervalDuration = totalDuration / (N - 1);

  const selectedCommits: any[] = [];
  let nextTargetDate = firstCommitDate;

  for (let i = 0; i < N; i++) {
    let closestCommit = allCommits[0];
    let minTimeDiff = Math.abs(nextTargetDate - closestCommit.date);

    for (const commit of allCommits) {
      const timeDiff = Math.abs(nextTargetDate - commit.date);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestCommit = commit;
      }
    }

    selectedCommits.push({
      commit: closestCommit.commit,
      timestamp: closestCommit.date.toISOString(),
    });
    nextTargetDate = addMilliseconds(
      firstCommitDate,
      intervalDuration * (i + 1),
    );
  }

  return selectedCommits;
};

const getCommitsToCheck = async (exec: any) => {
  const commits = await getAllCommits(exec);
  return await getNSamples(commits, 10);
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

    const packagesAnalysis = await Promise.all(
      getPackagesToCheck(packageJson, options)
        .map((packageName) => ({
          packageName,
          packageVersion: getPackageVersion(
            packageJson,
            packageName,
            pnpmWorkspace,
          ),
        }))
        .filter(
          (packageWithVersion) =>
            packageWithVersion.packageVersion !== null &&
            semver.validRange(packageWithVersion.packageVersion),
        )
        .map(({ packageName, packageVersion }) =>
          analyzePackage(packageName, packageVersion),
        ),
    );

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

  console.log(analysis);

  return analysis;
}
