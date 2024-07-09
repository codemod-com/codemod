import fs from "node:fs";
import path, { join } from "node:path";
import { type Api, api } from "@codemod.com/workflow";
import fetch from "npm-registry-fetch";
import semver from "semver";

const parsePackageKey = (
  libString: string,
): { name: string; version: string } => {
  const lastAtIndex = libString.lastIndexOf("@");

  if (lastAtIndex === -1) {
    throw new Error(
      'Invalid format. The input string must contain "@" symbol.',
    );
  }

  const name = libString.substring(0, lastAtIndex);
  const version = libString.substring(lastAtIndex + 1);

  return { name, version };
};

const getPackageVersions = async (packageName: string) => {
  try {
    return await fetch.json(packageName);
  } catch (error) {
    console.error(`Failed to fetch data for package ${packageName}:`, error);
    return null;
  }
};

const packageVersionsCache = new Map();

const getPackageData = async (packageKey: string) => {
  const { version, name } = parsePackageKey(packageKey);

  let packageVersions = packageVersionsCache.get(packageKey);

  if (packageVersions === undefined) {
    packageVersions = await getPackageVersions(name);

    packageVersionsCache.set(packageKey, packageVersions);
  }

  if (!packageVersions) {
    return null;
  }

  const versionNames = Object.keys(packageVersions.versions);

  const maxSatisfyingVersion = semver.maxSatisfying(versionNames, version);

  return maxSatisfyingVersion
    ? packageVersions.versions[maxSatisfyingVersion]
    : null;
};

const isStableVersion = (version: string) => !semver.prerelease(version);

const checkCompatibility = (
  packageVersions: any,
  packageVersion: string,
  currentVersion: string,
) => {
  const versions = Object.keys(packageVersions.versions);
  const stableVersions = versions.filter(isStableVersion);
  const compatibleVersions = stableVersions.filter((version) => {
    const dependencies =
      packageVersions.versions[version].peerDependencies || {};
    if (
      dependencies.react &&
      semver.gt(version, currentVersion) &&
      semver.satisfies(packageVersion, dependencies.react)
    ) {
      return true;
    }

    return false;
  });
  return compatibleVersions.length
    ? semver.minSatisfying(compatibleVersions, "*")
    : null;
};

const buildPackageKey = (name: string, version: string) => `${name}@${version}`;

const getDependenciesFromPackageJson = (filePath: string) => {
  const packageJsonPath = path.resolve(filePath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (!packageJson.dependencies) {
    throw new Error("No dependencies found in package.json");
  }

  const { dependencies, peerDependencies, devDependencies } = packageJson;

  const depsRecordToArr = (deps: Record<string, string>) =>
    Object.entries(deps ?? {}).map(([name, version]) =>
      buildPackageKey(name, version),
    );

  return {
    dependencies: depsRecordToArr(dependencies),
    peerDependencies: depsRecordToArr(peerDependencies),
    devDependencies: depsRecordToArr(devDependencies),
  };
};

type Package = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

type RawPackage = Package;

type Node = {
  package: Package;
  depth: number;
  parent: Set<Node> | null;
  children: Set<Node> | null;
};

function assertFulfilled<T>(
  item: PromiseSettledResult<T>,
): item is PromiseFulfilledResult<T> {
  return item.status === "fulfilled";
}

const buildNode = (node: Package): Node => {
  const { name, version, dependencies, devDependencies, peerDependencies } =
    node;

  return {
    package: {
      name,
      version,
      dependencies,
      devDependencies,
      peerDependencies,
    },
    parent: null,
    children: null,
    depth: 0,
  };
};

const buildNodesTree = async (
  rawPackage: RawPackage,
  depth = 0,
  maxDepth = DEFAULT_MAX_DEPTH,
) => {
  const parentNode = buildNode(rawPackage);

  parentNode.parent = new Set();
  parentNode.children = new Set();

  // @TODO do we need to check other kinds of dependencies?
  const dependencies = parentNode.package.peerDependencies ?? {};

  const dependenciesList = Object.keys(dependencies).map((dependency) =>
    buildPackageKey(dependency, dependencies[dependency] ?? ""),
  );

  const dependencyData = (
    await Promise.allSettled<RawPackage>(dependenciesList.map(getPackageData))
  )
    .filter(assertFulfilled)
    .map(({ value }) => value);

  if (depth > maxDepth) {
    return null;
  }

  const nodes = (
    await Promise.allSettled(
      dependencyData.map((pkg) => buildNodesTree(pkg, depth + 1, maxDepth)),
    )
  )
    .filter(assertFulfilled)
    .map(({ value }) => value);

  nodes.filter(Boolean).forEach((node) => {
    node?.parent?.add(parentNode);
    parentNode?.children?.add(node);
  });

  return parentNode;
};

const DEFAULT_MAX_DEPTH = 2;

const getDependencyTree = async (
  path: string,
  maxDepths = DEFAULT_MAX_DEPTH,
) => {
  const nodes = new Map();

  // @TODO remove test data
  const { dependencies } = getDependenciesFromPackageJson(path);

  for (const packageKey of dependencies) {
    const packageData = await getPackageData(packageKey);
    const treeNode = await buildNodesTree(packageData, 0, maxDepths);
    nodes.set(treeNode?.package.name, treeNode);
  }

  return nodes;
};

const getDependentPackages = async (packageName: string, path: string) => {
  const dependencyTree = await getDependencyTree(path);

  const dependents = new Set<Node>();

  function traverse(node: Node) {
    if (node.children) {
      for (const child of node.children) {
        if (child.package.name === packageName) {
          dependents.add(node);
        }
        traverse(child);
      }
    }
  }

  for (const node of dependencyTree.values()) {
    traverse(node);
  }

  return dependents;
};

type Options = {
  name: string;
  version: string;
  repo: string;
  depth: number;
};

type Report = { packages: Record<string, any>; target: any };

const consoleReporter = (report: Report) => {
  const { target, packages } = report;

  for (const [packageKey, packageReport] of Object.entries(packages)) {
    const { minVersion, isCompatible } = packageReport;

    if (minVersion) {
      console.log(
        `Package ${packageKey} supports ${target.name} ${target.version} starting from version ${minVersion}`,
      );
    } else {
      console.log(
        `Package ${packageKey} does not support ${target.name} ${target.version}`,
      );
    }
  }
};

export async function workflow({ git }: Api, options: Options) {
  await git.clone(options.repo);

  // @TODO hardcoded
  const path = `/var/folders/lb/jyy18cts4zb3xnwqs876921w0000gn/T/cm/git-github-com-dmytro-hryshyn-feature-flag-example-0`;
  const packageJsonPath = join(path, "package.json");

  const dependentPackages = await getDependentPackages(
    options.name,
    packageJsonPath,
  );

  const incompatiblePackages = [...dependentPackages.values()]
    .filter((pkg) => !semver.satisfies(options.version, pkg.package.name))
    .map((pkg) => [pkg.package.name, pkg.package.version]);

  const report: Report = {
    target: {
      name: options.name,
      version: options.version,
    },
    packages: {},
  };

  for (const [packageName, version] of incompatiblePackages) {
    // @TODO hardcoded
    if (
      ["react-dom", "react", "netlify-react-ui"].includes(packageName ?? "")
    ) {
      continue;
    }

    const packageKey = buildPackageKey(packageName ?? "", version ?? "");
    console.log(`Analyzing... ${packageKey}`);

    const packageVersions = packageVersionsCache.get(packageKey);

    if (!packageVersions) {
      continue;
    }

    const minVersion = checkCompatibility(
      packageVersions,
      options.version,
      version ?? "",
    );

    report.packages[packageKey] = {
      isCompatible: false,
      minVersion,
    };
  }

  consoleReporter(report);
}

workflow(api, {
  name: "react",
  version: "18.0.0",
  repo: "git@github.com:DmytroHryshyn/feature-flag-example",
  depth: 2,
});
