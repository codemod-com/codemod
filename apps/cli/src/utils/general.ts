import * as fs from "node:fs";
import { execPromise } from "@codemod-com/utilities";

export const isFile = async (path: string) =>
  fs.promises
    .lstat(path)
    .then((pathStat) => pathStat.isFile())
    .catch(() => false);

export const initGlobalNodeModules = async (): Promise<void> => {
  const globalPaths = await Promise.allSettled([
    execPromise("npm root -g"),
    execPromise("pnpm root -g"),
    execPromise("yarn global dir"),
    execPromise("echo $BUN_INSTALL/install/global/node_modules"),
  ]);
  process.env.NODE_PATH = globalPaths
    .map((res) => (res.status === "fulfilled" ? res.value.stdout.trim() : null))
    .filter(Boolean)
    .join(":");
  require("node:module").Module._initPaths();
};
