import semver from 'semver';
import semverDiff from "semver-diff";
import type { NormalizedRegistryData } from '../registry-utils';

export const runAnalysis = async (
    packageName: string,
    packageVersionRange: string,
    packageRegistryData: NormalizedRegistryData
) => {
    const { latest: latestStableRelease, next, versions, homepage } = packageRegistryData;

    const installedVersion = semver.minSatisfying(versions, packageVersionRange);

    const latest =
        installedVersion &&
            latestStableRelease &&
            next &&
            semver.gt(installedVersion, latestStableRelease)
            ? next
            : latestStableRelease;

    const versionWanted = semver.maxSatisfying(
        versions,
        packageVersionRange,
    );

    const versionToUse = installedVersion ?? versionWanted;
    const bump =
        versionToUse &&
        latest &&
        semver.valid(latest) &&
        semver.valid(versionToUse) &&
        semverDiff(versionToUse, latest);

    // @TODO normalize result
    return {
        // info
        moduleName: packageName,
        homepage,

        // versions
        latest: latest,
        installed: versionToUse,
        packageWanted: versionWanted,
        packageJson: packageVersionRange,
        mismatch:
            semver.validRange(packageVersionRange) &&
            semver.valid(versionToUse) &&
            !semver.satisfies(versionToUse ?? '', packageVersionRange),
        semverValid: semver.valid(versionToUse),
        easyUpgrade:
            semver.validRange(packageVersionRange) &&
            semver.valid(versionToUse) &&
            semver.satisfies(latest ?? '', packageVersionRange) &&
            bump !== "major",
        bump,
    };
};