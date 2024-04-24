import { createHash } from "node:crypto";
import { dirname, extname, join } from "node:path";
import {
  type FileSystem,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import type { Options } from "prettier";
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

export const DEFAULT_PRETTIER_OPTIONS: Options = {
  tabWidth: 4,
  useTabs: true,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  parser: "typescript",
};

const parserMappers = new Map<string, Options["parser"]>([
  ["ts", "typescript"],
  ["tsx", "typescript"],
  ["js", "babel"],
  ["jsx", "babel"],
  ["json", "json"],
  ["json5", "json5"],
  ["jsonc", "json"],
  ["css", "css"],
  ["scss", "scss"],
  ["less", "less"],
  ["graphql", "graphql"],
  ["md", "markdown"],
  ["mdx", "mdx"],
  ["html", "html"],
  ["vue", "vue"],
  ["yaml", "yaml"],
  ["yml", "yaml"],
]);

export const getConfig = async (path: string): Promise<Options> => {
  const { resolveConfig } = await import("prettier");
  let config = await resolveConfig(path, {
    editorconfig: false,
  });

  if (config === null || Object.keys(config).length === 0) {
    config = DEFAULT_PRETTIER_OPTIONS;
  }

  const parser: Options["parser"] =
    parserMappers.get(extname(path).slice(1)) ?? "typescript";

  return {
    ...config,
    parser,
  };
};

export const formatText = async (
  path: string,
  oldData: string,
  formatWithPrettier: boolean,
): Promise<string> => {
  const newData = oldData.replace(/\/\*\* \*\*\//gm, "");

  if (!formatWithPrettier) {
    return newData;
  }

  try {
    const { format } = await import("prettier");
    const options = await getConfig(path);
    return await format(newData, options);
  } catch (err) {
    console.log(err);
    return newData;
  }
};

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
