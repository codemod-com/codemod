import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { backOff } from "exponential-backoff";
import open from "open";
import { getGithubAPIKey, getGithubAvailableScope } from "./apis.js";
import { getCurrentUserData } from "./utils.js";

const routeUserToStudioForPermissions = ({
  printer,
  scopes,
}: {
  printer: PrinterBlueprint;
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
  printer: PrinterBlueprint;
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
