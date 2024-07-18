import { type Api, api } from "@codemod.com/workflow";
import gitUrl from "giturl";
import semver from "semver";
import semverDiff from "semver-diff";

type Options = {
  repos: string[];
  onlyProd: boolean;
};

type PackageData = {
  versions: Record<
    string,
    {
      homepage?: string;
      bugs?: {
        url?: string;
      };
      repository?: {
        url?: string;
      };
    }
  >;
  "dist-tags": Record<string, string>;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type PnpmWorkspace = {
  catalog?: Record<string, string>;
};

// Inspired by https://github.com/dylang/npm-check/blob/master/lib/in/create-package-summary.js

// @TODO will be used for change log parser
const getHomePage = (packageData: PackageData): string | null => {
  const latest = packageData["dist-tags"].latest;

  if (!latest) {
    return null;
  }

  const packageDataForLatest = packageData.versions[latest];
  const maybeUrl =
    packageDataForLatest?.bugs?.url ??
    packageDataForLatest?.repository?.url ??
    null;
  const maybeHomepage = packageDataForLatest?.homepage ?? null;

  return maybeUrl ? gitUrl.parse(maybeUrl) : maybeHomepage;
};

const getPackageData = async (packageName: string) => {
  const data = await fetch(`https://registry.npmjs.org/${packageName}`, {
    headers: { Accept: "application/json" },
  });

  if (data.status !== 200) {
    return null;
  }

  const rawData = (await data.json()) as PackageData;

  const sortedVersions = Object.keys(rawData.versions).sort(semver.compare);

  const latest = rawData["dist-tags"].latest;
  const next = rawData["dist-tags"].next;

  const latestStableRelease =
    latest && semver.satisfies(latest, "*")
      ? latest
      : semver.maxSatisfying(sortedVersions, "*");

  return {
    latest: latestStableRelease,
    next: next,
    versions: sortedVersions,
    homepage: getHomePage(rawData),
  };
};

const createPackageSummary = async (
  packageName: string,
  packageJsonVersion: string,
) => {
  const packageRegistryData = await getPackageData(packageName);

  if (!packageRegistryData) {
    console.warn(
      `Unable to get package registry data for ${packageName}. Skipping`,
    );
    return null;
  }

  // @TODO read from lock file?
  const installedVersion = undefined;

  const latest =
    installedVersion &&
    packageRegistryData.latest &&
    packageRegistryData.next &&
    semver.gt(installedVersion, packageRegistryData.latest)
      ? packageRegistryData.next
      : packageRegistryData.latest;

  const versions = packageRegistryData.versions || [];

  const versionWanted = semver.maxSatisfying(versions, packageJsonVersion);
  const versionToUse = installedVersion || versionWanted;

  const bump =
    versionToUse &&
    latest &&
    semver.valid(latest) &&
    semver.valid(versionToUse) &&
    semverDiff(versionToUse, latest);

  return {
    // info
    moduleName: packageName,
    homepage: packageRegistryData.homepage,
    regError: packageRegistryData.error,

    // versions
    latest: latest,
    installed: versionToUse,
    isInstalled: packageIsInstalled,
    notInstalled: !packageIsInstalled,
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

        report[packageJson.name] = await Promise.all(packageAnalysis);
      });
  });
}

workflow(api, {
  repos: ["git@github.com:codemod-com/codemod.git"],
});
