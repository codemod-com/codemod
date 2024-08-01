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

const getLatestStableVersionBeforeDate = (
  packageRegistryData: NormalizedRegistryData,
  date: Date,
) => {
  const { time } = packageRegistryData;

  const latestVersionBeforeDate = Object.entries(time)
    .filter(
      ([, versionDate]) => new Date(versionDate).getTime() < date.getTime(),
    )
    .map(([version]) => version)
    .reduce((latest, current) => {
      return semver.valid(latest) &&
        !semver.prerelease(latest) &&
        semver.valid(current) &&
        semver.gt(latest, current)
        ? latest
        : current;
    }, "0.0.0");

  // console.log(packageRegistryData.name, date, latestVersionBeforeDate, "??");

  return latestVersionBeforeDate;
};

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
  date: Date,
): Result => {
  const { time, versions } = packageRegistryData;

  const currentVersion = semver.minSatisfying(versions, packageVersionRange);
  const desiredVersion = getLatestStableVersionBeforeDate(
    packageRegistryData,
    date,
  );

  const currentVersionTime = currentVersion ? time[currentVersion] : null;
  const desiredVersionTime = desiredVersion ? time[desiredVersion] : null;

  return {
    drift: Number(getDrift(currentVersionTime, desiredVersionTime)),
    name: packageName,
  };
};
