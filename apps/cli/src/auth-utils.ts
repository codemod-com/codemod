import { backOff } from "exponential-backoff";
import inquirer from "inquirer";
import open from "open";

import type { GetUserDataResponse } from "@codemod-com/api-types";
import { type Printer, chalk } from "@codemod-com/printer";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { getGithubAPIKey, getGithubAvailableScope, getUserData } from "#api.js";
import {
  CredentialsStorageType,
  credentialsStorage,
} from "#credentials-storage.js";

export type UserData = GetUserDataResponse & {
  token: string;
};

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
  printer: Printer;
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

  await import("#commands/login.js").then(({ handleLoginCliCommand }) =>
    handleLoginCliCommand({ printer }),
  );

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

  return userData.organizations.map(mapFunc).filter(isNeitherNullNorUndefined);
};

const routeUserToStudioForPermissions = ({
  printer,
  scopes,
}: {
  printer: Printer;
  scopes: string[];
}) => {
  const success = open(
    `${process.env.CODEMOD_HOME_PAGE_URL}?permissions=github&scopes=${scopes.join("&scopes=")}`,
  );

  if (!success) {
    printer.printOperationMessage({
      kind: "error",
      message:
        "An unexpected error occurred while redirecting to the permissions page. Please submit a GitHub issue (github.com/codemod-com/codemod/issues/new) or report it to us (codemod.com/community).",
    });
  }
};

export const requestGithubPermissions = async (options: {
  scopes: string[];
  printer: Printer;
}) => {
  const { printer, scopes } = options;

  const userData = await getCurrentUserData();
  if (userData === null) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("You aren't logged in."),
    );
    return;
  }

  const spinner = printer.withLoaderMessage(
    chalk.cyan("Redirecting to page to request GitHub permissions"),
  );

  routeUserToStudioForPermissions({ printer, scopes });

  try {
    await backOff(
      async () => {
        const apiKey = await getGithubAPIKey(userData.token);
        if (!apiKey) {
          throw new Error("GitHub API key is not available.");
        }

        const availableScopes = await getGithubAvailableScope(apiKey);
        const allScopesAvailable = scopes.every((scope) =>
          availableScopes?.includes(scope),
        );
        if (!allScopesAvailable) {
          throw new Error("Required GitHub permissions are not available.");
        }
      },
      {
        numOfAttempts: 60, // 1 minute to login
        startingDelay: 1000, // ms
        timeMultiple: 1, // * 1
      },
    );

    spinner.succeed();
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("Permissions granted."),
    );
  } catch (e) {
    spinner.fail();
    throw new Error("Not enough permissions. Please try again.");
  }
};
