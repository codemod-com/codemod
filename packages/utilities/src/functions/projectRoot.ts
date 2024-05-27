import { constants, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { execPromise } from "./node.js";

export type PackageManager = "yarn" | "npm" | "pnpm" | "bun";

export const lockFilesToPmMap: Record<string, PackageManager> = {
  "package-lock.json": "npm",
  "yarn.lock": "yarn",
  "pnpm-lock.yaml": "pnpm",
  "bun.lockb": "bun",
};

export async function getProjectRootPathAndPackageManager(
  target: string,
  onlyRoot: true,
): Promise<{ rootPath: string | null }>;
export async function getProjectRootPathAndPackageManager(
  target: string,
  onlyRoot?: false,
): Promise<{ rootPath: string | null; detectedPackageManager: string | null }>;
export async function getProjectRootPathAndPackageManager(
  target: string,
  onlyRoot = false,
): Promise<
  | { rootPath: string | null }
  | { rootPath: string | null; detectedPackageManager: string | null }
> {
  let detectedPackageManager: PackageManager | null = null;

  let rootPath: string | null = null;
  try {
    const { stdout } = await execPromise("git rev-parse --show-toplevel", {
      cwd: target,
    });
    const output = stdout.trim();
    if (output.length) {
      rootPath = output;

      if (onlyRoot) {
        return { rootPath };
      }
    }
  } catch (error) {
    //
  }

  // did not find root using git CLI. we can try to find it using .git directory
  if (rootPath === null) {
    let currentDir = target;

    while (true) {
      try {
        await access(join(currentDir, ".git"), constants.R_OK | constants.W_OK);

        const packageJsonPath = join(currentDir, "package.json");

        await access(packageJsonPath, constants.R_OK | constants.W_OK);
        rootPath = currentDir;
      } catch {
        //
      }

      if (rootPath) {
        if (onlyRoot) {
          return { rootPath };
        }

        break;
      }

      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // Reached the filesystem root
      currentDir = parentDir;
    }
  }

  // do lockfiles lookup and determine package manager, set rootPath if it's still null
  let currentDir = target;

  while (true) {
    for (const lockFile of Object.keys(lockFilesToPmMap)) {
      try {
        await access(
          join(currentDir, lockFile),
          constants.R_OK | constants.W_OK,
        );

        detectedPackageManager = lockFilesToPmMap[lockFile]!;
        if (rootPath === null) {
          rootPath = currentDir;
        }

        break;
      } catch (err) {
        //
      }
    }

    if (rootPath) {
      if (onlyRoot) {
        return { rootPath };
      }

      break;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break; // Reached the filesystem root
    currentDir = parentDir;
  }

  return {
    rootPath,
    detectedPackageManager,
  };
}
