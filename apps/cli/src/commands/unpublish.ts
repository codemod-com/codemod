import { type Printer, chalk } from "@codemod-com/printer";
import {
  doubleQuotify,
  extractLibNameAndVersion,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { unpublish } from "../apis.js";
import { getCurrentUserOrLogin } from "../utils.js";

export const handleUnpublishCliCommand = async (options: {
  printer: Printer;
  name: string;
  force?: boolean;
}) => {
  const { printer, name, force } = options;

  const { token } = await getCurrentUserOrLogin({
    message: "Authentication is required to unpublish codemods. Proceed?",
    printer,
  });

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
