import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import open from "open";

export const handleFeedbackCommand = async (options: {
  printer: PrinterBlueprint;
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
