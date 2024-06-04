export type TelemetryEvent =
  | Readonly<{
      kind: "codemodExecuted";
      fileCount: number;
      executionId: string;
      codemodName: string;
      recipeName?: string;
    }>
  | Readonly<{
      kind: "failedToExecuteCommand";
      commandName: string;
    }>;
