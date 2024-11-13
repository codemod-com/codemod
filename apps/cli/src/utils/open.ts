import type { Printer } from "@codemod-com/printer";
import openOriginal from "open";

export async function open(url: string, printer: Printer) {
  try {
    // Show url inside coder
    if (process.env.CODER_WORKSPACE_AGENT_NAME) {
      throw new Error("Cannot open browser in a headless environment");
    }
    return await openOriginal(url);
  } catch (error: any) {
    printer.printOperationMessage({
      kind: "error",
      message: `Please open the following URL in your browser: ${url}`,
    });
  }
}
