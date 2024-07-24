export type CreateFileCommand = {
  kind: "createFile";
  newPath: string;
  newData: string;
};

export type UpdateFileCommand = {
  kind: "updateFile";
  oldPath: string;
  oldData: string;
  newData: string;
};

export type DeleteFileCommand = {
  kind: "deleteFile";
  oldPath: string;
};

export type MoveFileCommand = {
  kind: "moveFile";
  oldPath: string;
  newPath: string;
};

export type CopyFileCommand = {
  kind: "copyFile";
  oldPath: string;
  newPath: string;
};

export type FileCommand =
  | CreateFileCommand
  | UpdateFileCommand
  | DeleteFileCommand
  | MoveFileCommand
  | CopyFileCommand;
