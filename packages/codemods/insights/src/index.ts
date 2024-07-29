import type { Api } from "@codemod.com/workflow";

import { exec } from "child_process";
import {
  addMilliseconds,
  differenceInDays,
  differenceInMilliseconds,
  parseISO,
} from "date-fns";
import { daysInYear } from "date-fns/constants";
import semver from "semver";
import semverDiff from "semver-diff";
import { memoize } from "./cache-utils";
import {
  type NormalizedRegistryData,
  getPackageRegistryData,
  normalizePackageRegistryData,
} from "./registry-utils";

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

// Inspired by https://github.com/dylang/npm-check/blob/master/lib/in/create-package-summary.js

const memoizedGetPackageRegistryData = memoize(getPackageRegistryData);

const buildInsight = (
  packageName: string,
  packageJsonVersion: string,
  packageData: NormalizedRegistryData,
) => {
  const { latest: latestStableRelease, next, homepage, versions } = packageData;

  const installedVersion = undefined;

  const latest =
    installedVersion &&
    latestStableRelease &&
    next &&
    semver.gt(installedVersion, latestStableRelease)
      ? next
      : latestStableRelease;

  const versionWanted = semver.maxSatisfying(versions, packageJsonVersion);

  const versionToUse = installedVersion ?? versionWanted;
  const bump =
    versionToUse &&
    latest &&
    semver.valid(latest) &&
    semver.valid(versionToUse) &&
    semverDiff(versionToUse, latest);

  return {
    // info
    moduleName: packageName,
    homepage,

    // versions
    latest: latest,
    installed: versionToUse,
    packageWanted: versionWanted,
    packageJson: packageJsonVersion,
    mismatch:
      semver.validRange(packageJsonVersion) &&
      semver.valid(versionToUse) &&
      !semver.satisfies(versionToUse, packageJsonVersion),
    semverValid: semver.valid(versionToUse),
    easyUpgrade:
      semver.validRange(packageJsonVersion) &&
      semver.valid(versionToUse) &&
      semver.satisfies(latest, packageJsonVersion) &&
      bump !== "major",
    bump: bump,
  };
};

const buildLibyear = (
  packageName: string,
  packageJsonVersion: string,
  packageData: NormalizedRegistryData,
) => {
  const { latest: latestStableRelease, next, time, versions } = packageData;

  const currentVersion = semver.minSatisfying(versions, packageJsonVersion);

  const latest =
    currentVersion &&
    latestStableRelease &&
    next &&
    semver.gt(currentVersion, latestStableRelease)
      ? next
      : latestStableRelease;

  const currentVersionTime = currentVersion ? time[currentVersion] : null;
  const latestVersionTime = latest ? time[latest] : null;

  const drift =
    currentVersionTime && latestVersionTime
      ? differenceInDays(
          parseISO(latestVersionTime),
          parseISO(currentVersionTime),
        ) / daysInYear
      : null;

  return {
    packageName,
    drift,
  };
};

const createPackageSummary = async (
  packageName: string,
  packageJsonVersion: string,
) => {
  const packageRegistryData = await memoizedGetPackageRegistryData(packageName);

  if (!packageRegistryData) {
    console.warn(
      `Unable to get package registry data for ${packageName}. Skipping`,
    );
    return null;
  }

  return buildLibyear(
    packageName,
    packageJsonVersion,
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

const execShellCommand = (cmd: string) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

const getEvenlyDistributedCommits = async (allCommits: any[], N: number) => {
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

  selectedCommits.push(allCommits[0]);
  selectedCommits.push(allCommits[allCommits.length - 1]);

  return selectedCommits;
};

export async function workflow({ git }: Api, options: Options) {
  const report = [];

  let pnpmWorkspace: PnpmWorkspace | null = null;

  await git.clone(options.repos, async ({ files, exec }) => {
    const commits = await getAllCommits(execShellCommand);

    const distributedCommits = await getEvenlyDistributedCommits(commits, 10);

    console.log(distributedCommits);

    for (const { commit, date } of distributedCommits) {
      await execShellCommand(`git checkout ${commit}`);

      await files(PNPM_WORKSPACE_PATH)
        .yaml()
        .map<any, any>(async ({ getContents }) => {
          pnpmWorkspace = await getContents();
        });

      await files(`**/apps/**/package.json`)
        .json()
        .map<any, any>(async ({ getContents }) => {
          const packageJson = await getContents();

          const packagesToCheck = getPackagesToCheck(packageJson, options);

          const packageAnalysis = packagesToCheck.map((packageName) => {
            const packageVersion = getPackageVersion(
              packageJson,
              packageName,
              pnpmWorkspace,
            );

            if (packageVersion === null || !semver.validRange(packageVersion)) {
              console.warn(
                `Unable to get version for ${packageName} in ${packageJson.name} package. Skipping analysis.`,
              );
              return;
            }

            return createPackageSummary(packageName, packageVersion);
          });

          const awaitedPackageAnalysis = await Promise.all(packageAnalysis);

          const sumDrift = awaitedPackageAnalysis
            .filter(Boolean)
            .reduce((acc, item) => {
              if (item?.drift) {
                acc += item.drift;
              }

              return acc;
            }, 0);

          report.push({
            timestamp: date,
            drift: sumDrift,
            kind: "real_drift",
          });
        });
    }
  });

  console.log(report, "???");

  return report;
}

// workflow(api, { repos: ['git@github.com:DmytroHryshyn/feature-flag-example.git'] })
