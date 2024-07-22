import type { API, DataAPI, DirectoryAPI, FileAPI } from "./api.js";
import type { ExternalFileCommand } from "./types/external-commands.js";
import type {
  Command,
  DataCommand,
  DirectoryCommand,
  FileCommand,
  FinishCommand,
} from "./types/internal-commands.js";
import type { Options, RSU, State } from "./types/options.js";

type DistributedOmit<T, K> = T extends NonNullable<unknown>
  ? Pick<T, Exclude<keyof T, K>>
  : never;

export type CallbackService = Readonly<{
  onCommandExecuted?: (
    command: DistributedOmit<Command, "data" | "options">,
  ) => void;
  onError?: (path: string, message: string) => void;
}>;

export type HandleDirectory<D extends RSU, S extends State> = (
  api: DirectoryAPI<D>,
  path: string,
  options: Options,
  state: S | null,
) => Promise<readonly DirectoryCommand[]>;

export type HandleFile<D extends RSU, S> = (
  api: FileAPI<D>,
  path: string,
  options: Options,
  state: S | null,
) => Promise<readonly FileCommand[]>;

export type HandleData<D extends RSU, S extends State> = (
  api: DataAPI<D>,
  path: string,
  data: string,
  options: Options,
  state: S | null,
) => Promise<DataCommand>;

export type InitializeState<D extends RSU, S extends State> = (
  options: Options,
  previousState: S | null,
  api: API<D>,
  paths: readonly string[] | null,
) => Promise<S>;

export type HandleFinish<S extends State> = (
  options: Options,
  state: S | null,
) => Promise<FinishCommand>;

export interface Filemod<D extends RSU, S extends State> {
  readonly includePatterns?: readonly string[];
  readonly excludePatterns?: readonly string[];
  readonly handleDirectory?: HandleDirectory<D, S>;
  readonly handleFile?: HandleFile<D, S>;
  readonly handleData?: HandleData<D, S>;
  readonly initializeState?: InitializeState<D, S>;
  readonly handleFinish?: HandleFinish<S>;
}

const defaultHandleDirectory: HandleDirectory<RSU, State> = async (
  api,
  directoryPath,
  options,
) => {
  const commands: DirectoryCommand[] = [];

  const paths = await api.readDirectory(directoryPath);

  for (const path of paths) {
    const directory = api.isDirectory(path);

    if (directory) {
      commands.push({
        kind: "handleDirectory",
        path,
        options,
      });
    } else {
      commands.push({
        kind: "handleFile",
        path,
        options,
      });
    }
  }

  return commands;
};

const defaultHandleFile: Filemod<RSU, State>["handleFile"] = async (
  _,
  path,
  options,
) =>
  Promise.resolve([
    {
      kind: "upsertFile",
      path,
      options,
    },
  ]);

const defaultHandleData: Filemod<RSU, State>["handleData"] = async () =>
  Promise.resolve({
    kind: "noop",
  });

const handleCommand = async <D extends RSU, S extends State>(
  api: API<D>,
  filemod: Filemod<D, S>,
  command: Command,
  callbackService: CallbackService,
  state: S | null,
): Promise<void> => {
  if (command.kind === "handleDirectory") {
    const unifiedEntry = await api.unifiedFileSystem.upsertUnifiedDirectory(
      command.path,
    );

    if (unifiedEntry === null) {
      return;
    }

    const defaultDirectoryHandler = !filemod.includePatterns
      ? defaultHandleDirectory
      : null;

    const handleDirectory = filemod.handleDirectory ?? defaultDirectoryHandler;

    if (handleDirectory === null) {
      return;
    }

    const commands = await handleDirectory(
      api.directoryAPI,
      command.path,
      command.options,
      state,
    );

    for (const command of commands) {
      await handleCommand(api, filemod, command, callbackService, state);
    }

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      path: command.path,
    });
  }

  if (command.kind === "handleFile") {
    const unifiedEntry = await api.unifiedFileSystem.upsertUnifiedFile(
      command.path,
    );

    if (unifiedEntry === null) {
      return;
    }

    const handleFile = filemod.handleFile ?? defaultHandleFile;

    try {
      const commands = await handleFile(
        api.fileAPI,
        command.path,
        command.options,
        state,
      );

      for (const command of commands) {
        await handleCommand(api, filemod, command, callbackService, state);
      }
    } catch (error) {
      callbackService.onError?.(
        command.path,
        error instanceof Error ? error.message : String(error),
      );
    }

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      path: command.path,
    });
  }

  if (command.kind === "upsertFile") {
    const data = await api.unifiedFileSystem.readFile(command.path);

    const handleData = filemod.handleData ?? defaultHandleData;

    try {
      const dataCommand = await handleData(
        api.dataAPI,
        command.path,
        data,
        command.options,
        state,
      );

      await handleCommand(api, filemod, dataCommand, callbackService, state);
    } catch (error) {
      callbackService.onError?.(
        command.path,
        error instanceof Error ? error.message : String(error),
      );
    }

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      path: command.path,
    });
  }

  if (command.kind === "deleteFile") {
    api.unifiedFileSystem.deleteFile(command.path);

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      path: command.path,
    });
  }

  if (command.kind === "upsertData") {
    api.unifiedFileSystem.upsertData(command.path, command.data);

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      path: command.path,
    });
  }

  if (command.kind === "moveFile") {
    api.unifiedFileSystem.moveFile(command.oldPath, command.newPath);

    callbackService.onCommandExecuted?.({
      kind: command.kind,
      oldPath: command.oldPath,
      newPath: command.newPath,
    });
  }
};

export const executeFilemod = async <D extends RSU, S extends State>(
  api: API<D>,
  filemod: Filemod<D, S>,
  path: string,
  options: Options,
  callbackService: CallbackService,
  state: S | null = null,
): Promise<readonly ExternalFileCommand[]> => {
  const unifiedEntry = await api.unifiedFileSystem.upsertUnifiedEntry(path);

  if (unifiedEntry === null) {
    return [];
  }

  const paths =
    filemod.includePatterns && filemod.includePatterns.length > 0
      ? await api.unifiedFileSystem.getFilePaths(
          path,
          filemod.includePatterns,
          filemod.excludePatterns ?? [],
        )
      : null;

  const previousState = state ?? null;

  const nextState =
    (await filemod.initializeState?.(options, previousState, api, paths)) ??
    null;

  if (paths !== null) {
    for (const path of paths) {
      await handleCommand<D, S>(
        api,
        filemod,
        { kind: "handleFile", path, options },
        callbackService,
        nextState,
      );
    }
  } else {
    await handleCommand<D, S>(
      api,
      filemod,
      {
        kind:
          unifiedEntry.kind === "directory" ? "handleDirectory" : "handleFile",
        path,
        options,
      },
      callbackService,
      nextState,
    );
  }

  const finishCommand = (await filemod.handleFinish?.(options, nextState)) ?? {
    kind: "noop",
  };

  if (finishCommand.kind === "noop") {
    return api.unifiedFileSystem.buildExternalFileCommands();
  }

  return executeFilemod<D, S>(
    api,
    filemod,
    path,
    options,
    callbackService,
    nextState,
  );
};
