import { type Printer, chalk } from "@codemod-com/printer";
import { getCurrentUserData } from "#auth-utils.js";

export const handleWhoAmICommand = async (options: {
  printer: Printer;
}) => {
  const { printer } = options;

  const userData = await getCurrentUserData();

  if (userData === null) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.red("To use this command, please log in first."),
    );
    return;
  }

  printer.printConsoleMessage(
    "info",
    chalk.cyan("You are logged in as", `${chalk.bold(userData.name)}.`),
  );

  // if (organizations.length > 0) {
  //   printer.printConsoleMessage(
  //     "info",
  //     chalk.cyan(
  //       "You have access to the following organizations:\n",
  //       chalk.bold(`- ${getOrgsNames(userData).join("\n- ")}`),
  //     ),
  //   );
  // }
};
