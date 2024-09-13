import { backOff } from "exponential-backoff";
import open from "open";

import { type Printer, chalk } from "@codemod-com/printer";
import {
  confirmUserLoggedIn,
  generateUserLoginIntent,
  getCLIAccessToken,
} from "#api.js";
import { getCurrentUserData } from "#auth-utils.js";
import {
  CredentialsStorageType,
  credentialsStorage,
} from "#credentials-storage.js";

const ACCESS_TOKEN_REQUESTED_BY_CLI_KEY = "accessTokenRequestedByCLI";

const routeUserToStudioForLogin = (
  printer: Printer,
  sessionId: string,
  iv: string,
) => {
  const success = open(
    `${process.env.CODEMOD_HOME_PAGE_URL}?command=${ACCESS_TOKEN_REQUESTED_BY_CLI_KEY}&sessionId=${sessionId}&iv=${iv}`,
  );

  if (!success) {
    printer.printOperationMessage({
      kind: "error",
      message:
        "An unexpected error occurred while redirecting to the sign-in page. Please submit a GitHub issue (github.com/codemod-com/codemod/issues/new) or report it to us (codemod.com/community).",
    });
  }
};
export const handleLoginCliCommand = async (options: {
  printer: Printer;
  token?: string;
}) => {
  const { printer, token } = options;

  const userData = await getCurrentUserData();
  if (userData !== null) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("You're already logged in."),
    );
    return;
  }

  if (token) {
    const { token: cliToken } = await getCLIAccessToken(token);
    await credentialsStorage.set(CredentialsStorageType.ACCOUNT, cliToken);

    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("You are successfully logged in."),
    );
    return;
  }

  const { id: sessionId, iv: initVector } = await generateUserLoginIntent();

  const spinner = printer.withLoaderMessage(
    chalk.cyan("Redirecting to Codemod sign-in page"),
  );
  routeUserToStudioForLogin(printer, sessionId, initVector);
  try {
    const token = await backOff(
      () => confirmUserLoggedIn(sessionId, initVector),
      {
        numOfAttempts: 60, // 1 minute to login
        startingDelay: 1000, // ms
        timeMultiple: 1, // * 1
      },
    );

    const { token: cliToken } = await getCLIAccessToken(token);

    await credentialsStorage.set(CredentialsStorageType.ACCOUNT, cliToken);

    spinner.succeed();
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("You are successfully logged in."),
    );
  } catch (e) {
    spinner.fail();
    throw new Error("Could not validate access token. Please try again.");
  }
};
