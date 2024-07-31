import { differenceInDays, parseISO } from "date-fns";
import { daysInYear } from "date-fns/constants";
import semver from "semver";
import type { NormalizedRegistryData } from "../registry-utils.js";

export type Result = Record<string, any>;

const getDesiredVersion = (
  currentVersion: string | null,
  { latest: latestStableRelease, next }: NormalizedRegistryData,
) =>
  currentVersion &&
  latestStableRelease &&
  next &&
  semver.gt(currentVersion, latestStableRelease)
    ? next
    : latestStableRelease;

const getDrift = (
  currentVersionTime: string | null | undefined,
  desiredVersionTime: string | null | undefined,
) =>
  currentVersionTime && desiredVersionTime
    ? differenceInDays(
        parseISO(desiredVersionTime),
        parseISO(currentVersionTime),
      ) / daysInYear
    : null;

// Inspired by https://github.com/dylang/npm-check/ https://github.com/jdanil/libyear
export const runAnalysis = (
  packageName: string,
  packageVersionRange: string,
  packageRegistryData: NormalizedRegistryData,
): Result => {
  const { time, versions } = packageRegistryData;

  const currentVersion = semver.minSatisfying(versions, packageVersionRange);
  const desiredVersion = getDesiredVersion(currentVersion, packageRegistryData);

  const currentVersionTime = currentVersion ? time[currentVersion] : null;
  const desiredVersionTime = desiredVersion ? time[desiredVersion] : null;

  return {
    drift: Number(getDrift(currentVersionTime, desiredVersionTime)),
  };
};
