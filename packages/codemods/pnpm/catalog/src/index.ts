import type { Api } from "@codemod.com/workflow";
import * as semver from "semver";
import { invariant } from "ts-invariant";

type PackagesVersions = Record<
  string,
  {
    usages: number;
    versions: string[];
  }
>;

type PackageJson = {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const readDependencies = (
  packagesVersions: PackagesVersions,
  dependencies: Record<string, string> = {},
) => {
  for (const [name, version] of Object.entries(dependencies)) {
    if (version === "workspace:*" || !semver.validRange(version)) {
      continue;
    }

    if (!packagesVersions[name]) {
      packagesVersions[name] = {
        usages: 0,
        versions: [],
      };
    }

    packagesVersions[name].usages += 1;
    if (!packagesVersions[name].versions.includes(version)) {
      packagesVersions[name].versions.push(version);
    }
  }
};

export async function workflow({ files, dirs, question, exec }: Api) {
  const workspaceFile = files("pnpm-workspace.yaml").yaml();
  const workspaceConfig = (
    await workspaceFile.map(({ getContents }) =>
      getContents<{ packages: string[] }>(),
    )
  ).pop();

  invariant(workspaceConfig, "pnpm-workspace.yaml not found");

  const packagesVersions: PackagesVersions = {};

  const packageJsonFiles = dirs({
    dirs: workspaceConfig.packages,
    ignore: ["**/node_modules/**"],
  }).files("package.json");

  await packageJsonFiles.json(async ({ map }) => {
    const packageJson = (
      await map(({ getContents }) => getContents<PackageJson>())
    ).pop();

    if (!packageJson) {
      return;
    }

    readDependencies(packagesVersions, packageJson.dependencies);
    readDependencies(packagesVersions, packageJson.devDependencies);
  });

  invariant(
    Object.entries(packagesVersions).some(([_, { usages }]) => usages > 1),
    "No duplicated dependencies found",
  );

  const packagesWithDifferentVersions = Object.entries(packagesVersions)
    .filter(([_, { usages, versions }]) => usages > 1 && versions.length > 1)
    .map(([name, { versions }]) => ({
      name: `${name} (${versions.join(", ")})`,
      value: name,
    }));

  const { packagesToMergeVersion } = await question<{
    packagesToMergeVersion: string[];
  }>({
    name: "packagesToMergeVersion",
    type: "checkbox",
    message: `The following packages have 2 or more different versions in workspace.
Catalog supports only one version at a time for default configuration.
Latest version will be picked for each package and used in catalog.
By default all the packages are selected.
Select packages to merge versions:`,
    choices: packagesWithDifferentVersions,
    default: packagesWithDifferentVersions.map(({ value }) => value),
  });

  const updateCatalog = Object.fromEntries(
    Object.entries(packagesVersions)
      .filter(
        ([name, { usages, versions }]) =>
          usages > 1 &&
          (versions.length === 1 || packagesToMergeVersion.includes(name)),
      )
      .map(([name, { versions }]) => [
        name,
        versions
          .map((version) => ({
            version: version.replace(/[~\^]/g, ""),
            original: version,
          }))
          .sort((a, b) => semver.compare(a.version, b.version))
          .map(({ original }) => original)
          .pop() as string,
      ]),
  );

  invariant(
    Object.keys(updateCatalog).length > 0,
    "No packages selected for catalog",
  );

  console.log(
    `The following packages will be used in catalog: ${JSON.stringify(updateCatalog, null, 2)}`,
  );

  await workspaceFile.update<{ catalog: Record<string, string> }>(
    ({ catalog, ...rest }) => ({
      ...rest,
      catalog: {
        ...catalog,
        ...updateCatalog,
      },
    }),
  );

  await packageJsonFiles.json().update<PackageJson>((packageJson) => {
    for (const [name] of Object.entries(updateCatalog)) {
      if (packageJson.dependencies?.[name]) {
        packageJson.dependencies[name] = "catalog:";
      }
      if (packageJson.devDependencies?.[name]) {
        packageJson.devDependencies[name] = "catalog:";
      }
    }

    return packageJson;
  });

  await files("package.json")
    .json()
    .update<PackageJson>(async (packageJson) => {
      if (packageJson.packageManager) {
        const version = packageJson.packageManager.match(/pnpm@(.*)/)?.[1];
        if (version && semver.lt(version, "9.5.0")) {
          packageJson.packageManager = "pnpm@9.5.0";
        }
      }
      return packageJson;
    });

  await exec("pnpm", ["install"]);
}
