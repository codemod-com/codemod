import * as os from "node:os";
import { homedir } from "node:os";
import { join } from "node:path";
import type { GetUserDataResponse } from "@codemod-com/api-types";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { execPromise, isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { glob } from "glob";
import inquirer from "inquirer";
import keytar from "keytar";
import { getUserData } from "./apis";
import { handleLoginCliCommand } from "./commands/login";

type UserData = GetUserDataResponse & {
  account: string;
  token: string;
};

export const getUserCredentials = async (): Promise<{
  account: string;
  password: string;
} | null> => {
  try {
    return (await keytar.findCredentials("codemod.com"))[0] ?? null;
  } catch (err) {
    if (os.platform() === "linux") {
      throw new Error(
        chalk(
          `Codemod CLI uses "keytar" to store your credentials securely.`,
          `\nPlease make sure you have "libsecret" installed on your system.`,
          "\nDepending on your distribution, you will need to run the following command",
          "\nDebian/Ubuntu:",
          chalk.bold("sudo apt-get install libsecret-1-dev"),
          "\nFedora:",
          chalk.bold("sudo dnf install libsecret"),
          "\nArch Linux:",
          chalk.bold("sudo pacman -S libsecret"),
          `\n\n${String(err)}`,
        ),
      );
    }

    throw err;
  }
};

export const getCurrentUserData = async (): Promise<UserData | null> => {
  const userCredentials = await getUserCredentials();

  if (!isNeitherNullNorUndefined(userCredentials)) {
    return null;
  }

  const { account, password: token } = userCredentials;

  const responseData = await getUserData(token);

  if (responseData === null) {
    await keytar.deletePassword("codemod.com", account);
    return null;
  }

  return { ...responseData, token, account: userCredentials.account };
};

export const getCurrentUserOrLogin = async (options: {
  message: string;
  printer: PrinterBlueprint;
  onEmptyAfterLoginText?: string;
}) => {
  const { message, printer } = options;

  let userData = await getCurrentUserData();

  if (userData !== null) {
    return userData;
  }

  const { login } = await inquirer.prompt<{ login: boolean }>({
    type: "confirm",
    name: "login",
    message,
  });

  if (!login) {
    throw new Error(
      "Refused to login for a command that requires authentication. Aborting...",
    );
  }

  await handleLoginCliCommand({ printer });
  userData = await getCurrentUserData();

  if (userData === null) {
    throw new Error(
      options.onEmptyAfterLoginText ??
        "Unexpected empty user data after authentication. Aborting...",
    );
  }

  return userData;
};

export const getOrgsNames = (
  userData: UserData,
  type: "slug" | "name" | "slug-and-name" = "slug",
): string[] => {
  let mapFunc: (org: UserData["organizations"][number]) => string | null;
  switch (type) {
    case "slug":
      mapFunc = (org) => org.organization.slug;
      break;
    case "name":
      mapFunc = (org) => org.organization.name;
      break;
    case "slug-and-name":
      mapFunc = (org) => {
        if (org.organization.name === org.organization.slug) {
          return org.organization.name;
        }

        return `${org.organization.name} (${org.organization.slug})`;
      };
      break;
    default:
      throw new Error("Invalid type");
  }

  return userData.organizations.map(mapFunc).filter(isNeitherNullNorUndefined);
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

export const rebuildCodemodFallback = async (options: {
  globPattern: string | string[];
  source: string;
  errorText: string;
  onSuccess?: () => void;
  onFail?: () => void;
}): Promise<string> => {
  const { globPattern, source, errorText, onSuccess, onFail } = options;

  const locateMainFile = async () => {
    const mainFiles = await glob(globPattern, {
      absolute: true,
      ignore: ["**/node_modules/**"],
      cwd: source,
      nodir: true,
    });

    return mainFiles.at(0);
  };

  let mainFilePath = await locateMainFile();

  try {
    // Try to build the codemod anyways, and if after build there is still no main file
    // or the process throws - throw an error
    await execPromise("codemod build", { cwd: source });

    mainFilePath = await locateMainFile();
    // Likely meaning that the "codemod build" command succeeded, but the file was still not found in output
    if (mainFilePath === undefined) {
      throw new Error();
    }
    onSuccess?.();
  } catch (error) {
    onFail?.();
    throw new Error(errorText);
  }

  return mainFilePath;
};

export const oraCheckmark = chalk.green("✔");
export const oraCross = chalk.red("✖");
