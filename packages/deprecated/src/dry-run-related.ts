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
