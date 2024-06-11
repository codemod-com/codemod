import { createHash } from "node:crypto";
import { dirname, extname, join } from "node:path";
import {
  type FileSystem,
  formatText,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import type { RunSettings } from "./schemata/runArgvSettingsSchema.js";

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

export type FormattedFileCommand = FileCommand & { formatted: true };

export const buildFormattedFileCommand = async (
  command: FileCommand,
): Promise<FormattedFileCommand | null> => {
  if (command.kind === "createFile") {
    const newData = await formatText(
      command.newPath,
      command.newData,
      command.formatWithPrettier,
    );

    return {
      ...command,
      newData,
      formatted: true,
    };
  }

  if (command.kind === "updateFile") {
    const newData = await formatText(
      command.oldPath,
      command.newData,
      command.formatWithPrettier,
    );

    if (command.oldData === newData) {
      return null;
    }

    return {
      ...command,
      newData,
      formatted: true,
    };
  }

  return {
    ...command,
    formatted: true,
  };
};

export const buildFormattedFileCommands = async (
  commands: readonly FileCommand[],
): Promise<readonly FormattedFileCommand[]> => {
  const formattedFileCommands = await Promise.all(
    commands.map((command) => buildFormattedFileCommand(command)),
  );

  return formattedFileCommands.filter(isNeitherNullNorUndefined);
};

export const modifyFileSystemUponWetRunCommand = async (
  fileSystem: FileSystem,
  command: FormattedFileCommand,
): Promise<void> => {
  if (command.kind === "createFile") {
    const directoryPath = dirname(command.newPath);

    await fileSystem.promises.mkdir(directoryPath, { recursive: true });

    return fileSystem.promises.writeFile(command.newPath, command.newData);
  }

  if (command.kind === "deleteFile") {
    return fileSystem.promises.unlink(command.oldPath);
  }

  if (command.kind === "moveFile") {
    await fileSystem.promises.copyFile(command.oldPath, command.newPath);

    return fileSystem.promises.unlink(command.oldPath);
  }

  if (command.kind === "updateFile") {
    return fileSystem.promises.writeFile(command.oldPath, command.newData);
  }

  if (command.kind === "copyFile") {
    const directoryPath = dirname(command.newPath);

    await fileSystem.promises.mkdir(directoryPath, { recursive: true });

    return fileSystem.promises.copyFile(command.oldPath, command.newPath);
  }
};

export const buildNewDataPathForCreateFileCommand = (
  outputDirectoryPath: string,
  command: FormattedFileCommand & { kind: "createFile" },
): string => {
  const hashDigest = createHash("md5")
    .update(command.kind)
    .update(command.newPath)
    .update(command.newData)
    .digest("base64url");

  const extName = extname(command.newPath);

  return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export const buildNewDataPathForUpdateFileCommand = (
  outputDirectoryPath: string,
  command: FormattedFileCommand & { kind: "updateFile" },
): string => {
  const hashDigest = createHash("md5")
    .update(command.kind)
    .update(command.oldPath)
    .update(command.newData)
    .digest("base64url");

  const extName = extname(command.oldPath);

  return join(outputDirectoryPath, `${hashDigest}${extName}`);
};

export const modifyFileSystemUponDryRunCommand = async (
  fileSystem: FileSystem,
  outputDirectoryPath: string,
  command: FormattedFileCommand,
): Promise<void> => {
  if (command.kind === "createFile") {
    const newDataPath = buildNewDataPathForCreateFileCommand(
      outputDirectoryPath,
      command,
    );

    await fileSystem.promises.writeFile(newDataPath, command.newData);
  }

  if (command.kind === "updateFile") {
    const newDataPath = buildNewDataPathForUpdateFileCommand(
      outputDirectoryPath,
      command,
    );

    await fileSystem.promises.writeFile(newDataPath, command.newData);
  }
};

export const modifyFileSystemUponCommand = (
  fileSystem: FileSystem,
  runSettings: RunSettings,
  command: FormattedFileCommand,
) => {
  return runSettings.dryRun === true
    ? modifyFileSystemUponDryRunCommand(
        fileSystem,
        runSettings.outputDirectoryPath,
        command,
      )
    : modifyFileSystemUponWetRunCommand(fileSystem, command);
};
