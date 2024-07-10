import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  doubleQuotify,
  extractLibNameAndVersion,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import inquirer from "inquirer";
import { unpublish } from "../apis.js";
import { getCurrentUserData } from "../utils.js";
import { handleLoginCliCommand } from "./login.js";

export const handleUnpublishCliCommand = async (options: {
  printer: PrinterBlueprint;
  name: string;
  force?: boolean;
}) => {
  const { printer, name, force } = options;

  let userData = await getCurrentUserData();

  if (userData === null) {
    const { login } = await inquirer.prompt<{ login: boolean }>({
      type: "confirm",
      name: "login",
      message: "Authentication is required to unpublish codemods. Proceed?",
    });

    if (!login) {
      return;
    }

    await handleLoginCliCommand({ printer });
    userData = await getCurrentUserData();

    if (userData === null) {
      throw new Error("Unexpected authentication error occurred.");
    }
  }

  const { libName: codemodName, version } = extractLibNameAndVersion(name);

  if (
    isNeitherNullNorUndefined(codemodName) &&
    !isNeitherNullNorUndefined(version) &&
    !force
  ) {
    throw new Error(
      `Please provide the version of the codemod you want to unpublish. If you want to unpublish all versions, use the "${chalk.bold(
        "--force (-f)",
      )}" flag.`,
    );
  }

  const { token } = userData;

  const spinner = printer.withLoaderMessage(
    chalk.cyan("Unpublishing ", chalk.bold(doubleQuotify(name))),
  );

  try {
    await unpublish(token, name);
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    const message =
      error instanceof AxiosError ? error.response?.data.error : String(error);
    const errorMessage = `${chalk.bold(
      `Could not unpublish the "${name}" codemod`,
    )}:\n${message}`;
    printer.printOperationMessage({ kind: "error", message: errorMessage });
    return;
  }

  printer.printConsoleMessage(
    "info",
    chalk.cyan(
      "Codemod",
      chalk.bold(doubleQuotify(name)),
      "was successfully unpublished.",
    ),
  );
};
