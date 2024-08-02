import gitUrl from "giturl";
import semver from "semver";

type RawPackageRegistryData = {
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

export const getHomePage = (
  packageData: RawPackageRegistryData,
): string | null => {
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

export const isStableRelease = (packageVersion: string): boolean =>
  semver.satisfies(packageVersion, "*");

export const getLatestStableRelease = (
  packageRegistryData: RawPackageRegistryData,
): string | null => {
  const latest = packageRegistryData["dist-tags"].latest;

  if (!latest) {
    return null;
  }

  return isStableRelease(latest)
    ? latest
    : semver.maxSatisfying(Object.keys(packageRegistryData.versions), "*");
};

export const getPackageRegistryData = async (
  packageName: string,
): Promise<RawPackageRegistryData | null> => {
  try {
    const data = await fetch(`https://registry.npmjs.org/${packageName}`, {
      headers: { Accept: "application/json" },
    });

    if (data.status !== 200) {
      throw new Error("Unable to get package registry data");
    }

    return (await data.json()) as RawPackageRegistryData;
  } catch (e) {
    console.error(`Unable to get registry data for ${packageName}.`);

    return null;
  }
};

// return {
//     latest: getLatestStableRelease(rawData),
//     next: rawData["dist-tags"].next,
//     versions: Object.keys(rawData.versions).sort(semver.compare),
//     homepage: getHomePage(rawData),
//   };
