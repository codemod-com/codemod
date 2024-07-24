import open from "open";

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

  const success = await open(feedbackUrl);

  if (!success) {
    printer.printOperationMessage({
      kind: "error",
      message:
        "Unexpected error occurred while redirecting to the feedback page.",
    });
  }
};
