export interface ExternalUpsertFileCommand {
  kind: "upsertFile";
  path: string;
  oldData: string;
  newData: string;
}

export interface ExternalDeleteFileCommand {
  kind: "deleteFile";
  path: string;
}

export type ExternalFileCommand =
  | ExternalUpsertFileCommand
  | ExternalDeleteFileCommand;
