import type { Printer } from "@codemod-com/printer";
import openOriginal from "open";

export async function open(url: string, printer: Printer) {
  try {
    return await openOriginal(url);
  } catch (error: any) {
    printer.printOperationMessage({
      kind: "error",
      message: `Please open the following URL in your browser: ${url}`,
    });
  }
}
