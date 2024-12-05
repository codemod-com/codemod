import { open } from "../utils/open.js";

import { type Printer, chalk } from "@codemod-com/printer";

export const handleFeedbackCommand = async (options: {
  printer: Printer;
}) => {
  const { printer } = options;
  const feedbackUrl = "https://go.codemod.com/feedback";

  printer.printConsoleMessage(
    "info",
    chalk.cyan("Redirecting to the feedback page..."),
  );

  await open(feedbackUrl, printer);
};
