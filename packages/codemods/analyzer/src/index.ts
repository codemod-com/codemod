import fs from "node:fs";
import path from "node:path";
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

// const getMaxSatisfyingVersion = (versions: string[], versionRange: string) =>
//   semver.maxSatisfying(versions, versionRange);

const getPackageData = async (packageKey: string) => {
  const { version, name } = parsePackageKey(packageKey);

  const packageVersions = await getPackageVersions(name);

  if (!packageVersions) {
    return null;
  }

  const versionNames = Object.keys(packageVersions.versions);

  const maxSatisfyingVersion = semver.maxSatisfying(versionNames, version);

  return maxSatisfyingVersion
    ? packageVersions.versions[maxSatisfyingVersion]
    : null;
};

function isStableVersion(version: string) {
  return !semver.prerelease(version);
}

// function checkCompatibility(packageData, packageVersion, pckVersion) {
//   const versions = Object.keys(packageData.versions);
//   const stableVersions = versions.filter(isStableVersion);
//   const compatibleVersions = stableVersions.filter((version) => {
//     const dependencies = packageData.versions[version].peerDependencies || {};
//     if (
//       dependencies.react &&
//       semver.gt(version, pckVersion) &&
//       semver.satisfies(packageVersion, dependencies.react)
//     ) {
//       // console.log(`isCompat ${packageData.name}@${version}:`, dependencies.react, packageVersion);

//       return true;
//     }

//     return false;
//   });
//   return compatibleVersions.length
//     ? semver.minSatisfying(compatibleVersions, "*")
//     : null;
// }

// const arb = new Arborist();

const getDependenciesFromPackageJson = (filePath: string) => {
  try {
    const packageJsonPath = path.resolve(filePath);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (!packageJson.dependencies) {
      throw new Error("No dependencies found in package.json");
    }

    const dependencies = packageJson.dependencies;
    const dependenciesList = Object.keys(dependencies).map(
      (dependency) => `${dependency}@${dependencies[dependency]}`,
    );

    return dependenciesList;
  } catch (error) {
    console.error(`Error reading or parsing package.json: ${error.message}`);
    return [];
  }
};

const analyzePackageJson = async (pathToPackage = "./package.json") => {
  const deps = getDependenciesFromPackageJson(pathToPackage);

  const data = await Promise.allSettled(deps.slice(0, 5).map(getPackageData));

  return data.map(({ value }) => value);
};

// const getPackagesData = async (entry) => {
//   const dependencies = entry.package.dependencies ?? {};

//   const dependenciesList = Object.keys(dependencies).map(
//     (dependency) => `${dependency}@${dependencies[dependency]}`,
//   );

//   return await Promise.allSettled(
//     dependenciesList.slice(0, 5).map(getPackageData),
//   );
// };

// const entries = await analyzePackageJson();
// const nodes = new Map();
// const parentNodesMap = new Map();
// const rootNodes = new Map();

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
  maxDepth = 2,
) => {
  const parentNode = buildNode(rawPackage);

  parentNode.parent = new Set();
  parentNode.children = new Set();

  const dependencies = {
    // ...parentNode.package.dependencies,
    // ...parentNode.package.devDependencies,
    ...parentNode.package.peerDependencies,
  };

  const dependenciesList = Object.keys(dependencies).map(
    (dependency) => `${dependency}@${dependencies[dependency]}`,
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

// await Promise.allSettled(entries.map(buildNodesTree));

// console.log([...nodes.values()], "???");

// const packageVersion = "18.3.1";

// const main = async () => {
//     const tree = await arb.loadActual();

//     const reactNode = [...tree.children.values()].find(({ name }) => name === 'react');
//     const edgesIn = [...reactNode.edgesIn.values()];

//     const incompatiblePackages = edgesIn.filter(edge => !semver.satisfies(packageVersion, edge.spec));

//     const pkgs = incompatiblePackages.map(({ from }) => ([from.name, from.version]))

//     for (const [packageName, version] of pkgs) {
//         if(['react-dom', 'react', 'netlify-react-ui'].includes(packageName)) {
//             continue;
//         }
//         const packageData = await getPackageData(packageName);
//         if (packageData) {
//           const minVersion = checkCompatibility(packageData, packageVersion, version);
//           if (minVersion) {
//             console.log(`Package ${packageName}@${version} supports React ${packageVersion} starting from version ${minVersion}`);
//           } else {
//             console.log(`Package ${packageName}@${version} does not support React ${packageVersion}`);
//           }
//         } else {
//           console.log(`Could not retrieve data for package ${packageName}`);
//         }
//       }
// }

// main();

// getTopLevelPackages();

const analyze = async () => {
  const nodes = new Map();

  const packages = await analyzePackageJson("./test.json");
  const promises = packages.map((pkg) => buildNodesTree(pkg, 0, 2));

  (await Promise.all(promises)).forEach((node) =>
    nodes.set(node?.package.name, node),
  );

  return nodes;
};

const getDependentPackages = async (packageName: string) => {
  const dependencyTree = await analyze();

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

getDependentPackages("react");
