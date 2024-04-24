import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  type ValidateTokenResponse,
  execPromise,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import keytar from "keytar";
import { validateAccessToken } from "./apis";

export const openURL = (url: string): boolean => {
  // `spawnSync` is used because `execSync` has an input length limit
  const command = process.platform === "win32" ? "start" : "open";
  const args = [url];

  // By setting `shell: false`,
  // we avoid potential command-line length limitations
  // and the full URL should be passed to the default web browser without getting truncated

  try {
    spawnSync(command, args, { stdio: "ignore", shell: false });
    return true;
  } catch (error) {
    console.error("Error while opening URL:", error);
    return false;
  }
};

type UserData = {
  user: ValidateTokenResponse;
  token: string;
};

export const getCurrentUserData = async (): Promise<UserData | null> => {
  const [userCredentials] = await keytar.findCredentials("codemod.com");

  if (!isNeitherNullNorUndefined(userCredentials)) {
    return null;
  }

  const { account, password: token } = userCredentials;
  let responseData: ValidateTokenResponse;
  try {
    responseData = await validateAccessToken(token);
  } catch (error) {
    await keytar.deletePassword("codemod.com", account);
    return null;
  }

  return { user: responseData, token };
};

export const getOrgsNames = (
  userData: UserData,
  type: "slug" | "name" | "slug-and-name" = "slug",
): string[] => {
  let mapFunc: (
    org: UserData["user"]["organizations"][number],
  ) => string | null;
  switch (type) {
    case "slug":
      mapFunc = (org) => org.slug;
      break;
    case "name":
      mapFunc = (org) => org.name;
      break;
    case "slug-and-name":
      mapFunc = (org) => {
        if (org.name === org.slug) {
          return org.name;
        }

        return `${org.name} (${org.slug})`;
      };
      break;
    default:
      throw new Error("Invalid type");
  }

  return userData.user.organizations
    .map(mapFunc)
    .filter(isNeitherNullNorUndefined);
};

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

export const getConfigurationDirectoryPath = (argvUnderScore?: unknown) =>
  join(
    String(argvUnderScore) === "runOnPreCommit" ? process.cwd() : homedir(),
    ".codemod",
  );
