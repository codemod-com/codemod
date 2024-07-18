import * as fs from "node:fs";
import * as os from "node:os";
import { homedir } from "node:os";
import { doubleQuotify } from "@codemod-com/utilities";
import inquirer from "inquirer";
import keytar from "keytar";
import unzipper from "unzipper";

import type { GetUserDataResponse } from "@codemod-com/api-types";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { execPromise, isNeitherNullNorUndefined } from "@codemod-com/utilities";

import { basename, dirname, join } from "node:path";
import { version } from "#/../package.json";
import { getUserData } from "#apis.js";
import { handleLoginCliCommand } from "#commands/login.js";

export const codemodDirectoryPath = join(homedir(), ".codemod");

type UserData = GetUserDataResponse & {
  token: string;
};

export const credentialsStorage = new CredentialsStorage();

export const getCurrentUserData = async (): Promise<UserData | null> => {
  const token = await credentialsStorage.get(CredentialsStorageType.ACCOUNT);

  if (!isNeitherNullNorUndefined(token)) {
    return null;
  }

  const responseData = await getUserData(token);

  if (responseData === null) {
    await credentialsStorage.delete(CredentialsStorageType.ACCOUNT);
    return null;
  }

  return { ...responseData, token };
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

export const unpackZipCodemod = async (options: {
  source: string;
  target: string;
}) => {
  const { source, target } = options;

  let resultPath: string | null = null;

  const zip = fs
    .createReadStream(source)
    .pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of zip) {
    const writablePath = join(target, entry.path);

    if (entry.type === "Directory") {
      await fs.promises.mkdir(writablePath, { recursive: true });
      entry.autodrain(); // Skip processing the content of directory entries
    } else {
      if (basename(entry.path) === ".codemodrc.json") {
        resultPath = dirname(writablePath);
      }
      await fs.promises.mkdir(dirname(writablePath), { recursive: true });
      entry.pipe(fs.createWriteStream(writablePath));
    }
  }

  if (resultPath === null) {
    await fs.promises.rm(target, { recursive: true });
    return null;
  }

  return resultPath;
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

export const writeLogs = async (options: {
  prefix: string;
  content: string;
  fatal?: boolean;
}): Promise<string> => {
  const { prefix, content, fatal } = options;

  const logsPath = join(codemodDirectoryPath, "logs");
  const logFilePath = join(
    logsPath,
    `${fatal ? "FATAL-" : ""}${new Date().toISOString()}-error.log`,
  );

  const logsContent = `- CLI version: ${version}
- Node version: ${process.versions.node}
- OS: ${os.type()} ${os.release()} ${os.arch()}

${content}
`;

  try {
    await fs.promises.mkdir(logsPath, { recursive: true });
    await fs.promises.writeFile(logFilePath, logsContent);

    return chalk.cyan(
      prefix ? `\n${prefix}` : "",
      `\nLogs can be found at:`,
      chalk.bold(logFilePath),
      "\nFor feedback or reporting issues, run",
      chalk.bold(doubleQuotify("codemod feedback")),
      "and include the logs.",
    );
  } catch (err) {
    return `Failed to write error log file at ${logFilePath}. Please verify that codemod CLI has the necessary permissions to write to this location.`;
  }
};

export const oraCheckmark = chalk.green("✔");
export const oraCross = chalk.red("✖");
