import type { Api } from "@codemod.com/workflow";

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

  return buildInsight(
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

export async function workflow({ git }: Api, options: Options) {
  const report: Record<string, unknown> = {};

  let pnpmWorkspace: PnpmWorkspace | null = null;

  await git.clone(options.repos, async ({ files }) => {
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

        report[packageJson.name] = awaitedPackageAnalysis;
      });
  });

  return report;
}
