export type CreateFileCommand = Readonly<{
  kind: "createFile";
  newPath: string;
  newData: string;
  formatWithPrettier: boolean;
}>;

export type UpdateFileCommand = Readonly<{
  kind: "updateFile";
  oldPath: string;
  oldData: string;
  newData: string;
  formatWithPrettier: boolean;
}>;

export type DeleteFileCommand = Readonly<{
  kind: "deleteFile";
  oldPath: string;
}>;

export type MoveFileCommand = Readonly<{
  kind: "moveFile";
  oldPath: string;
  newPath: string;
}>;

export type CopyFileCommand = Readonly<{
  kind: "copyFile";
  oldPath: string;
  newPath: string;
}>;

export type FileCommand =
  | CreateFileCommand
  | UpdateFileCommand
  | DeleteFileCommand
  | MoveFileCommand
  | CopyFileCommand;
