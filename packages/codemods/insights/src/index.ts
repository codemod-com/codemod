import { type Api, api } from "@codemod.com/workflow";
import gitUrl from "giturl";
import semver from "semver";
import semverDiff from "semver-diff";

type Options = {
  repos: string[];
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
  cwdPackageJson: any,
  packageName: string,
  catalog?: Record<string, string>,
) => {
  const packageIsInstalled = false;
  let packageJsonVersion =
    cwdPackageJson.dependencies[packageName] ??
    cwdPackageJson.devDependencies[packageName];

  if (packageJsonVersion === "catalog:") {
    packageJsonVersion = catalog?.[packageName];
  }

  if (packageJsonVersion && !semver.validRange(packageJsonVersion)) {
    return null;
  }

  const fromRegistry = await getPackageData(packageName);

  if (!fromRegistry) {
    return null;
  }

  // @TODO read from lock file?
  const installedVersion = undefined;

  const latest =
    installedVersion &&
    fromRegistry.latest &&
    fromRegistry.next &&
    semver.gt(installedVersion, fromRegistry.latest)
      ? fromRegistry.next
      : fromRegistry.latest;

  const versions = fromRegistry.versions || [];

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
    homepage: fromRegistry.homepage,
    regError: fromRegistry.error,

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

export async function workflow({ git }: Api, options: Options) {
  const report: Record<string, unknown> = {};
  const pnpmCatalog: Record<string, string> = {};

  await git.clone(options.repos, async ({ files }) => {
    await files("**/pnpm-workspace.yaml")
      .yaml()
      .map<any, any>(async ({ getContents }) => {
        const content = await getContents();

        Object.assign(pnpmCatalog, content.catalog ?? {});
      });

    await files(`**/apps/**/package.json`)
      .json()
      .map<any, any>(async ({ getContents }) => {
        const packageJson = await getContents();

        const depsToCheck = [
          ...Object.keys(packageJson["dependencies"]),
          ...Object.keys(packageJson["devDependencies"]),
        ];

        const analysis = depsToCheck.map((dep) =>
          createPackageSummary(packageJson, dep, pnpmCatalog),
        );

        report[packageJson.name] = await Promise.all(analysis);
      });
  });

  console.log(JSON.stringify(report, null, 2), "???");
}

workflow(api, {
  repos: ["git@github.com:codemod-com/codemod.git"],
});
