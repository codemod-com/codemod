export type TelemetryEvent =
  | Readonly<{
      kind: "codemodExecuted";
      fileCount: number;
      executionId: string;
      codemodName: string;
      cliVersion: string;
    }>
  | Readonly<{
      kind: "failedToExecuteCommand";
      commandName: string;
      cliVersion: string;
    }>
  | Readonly<{
      kind: "codemodPublished";
      codemodName: string;
      version: string;
      cliVersion: string;
    }>;
