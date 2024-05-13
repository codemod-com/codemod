import type {
  OperationMessage,
  WorkerThreadMessage,
} from "@codemod-com/printer";

export type PrinterMessageCallback = (
  message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
) => void;

export type CodemodExecutionError = {
  message: string;
  codemodName?: string;
  filePath: string;
};

export type CodemodExecutionErrorCallback = (
  error: CodemodExecutionError,
) => unknown;
