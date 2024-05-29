import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Filemod } from "@codemod-com/filemod";
import { boxen, chalk, colorLongString } from "@codemod-com/printer";
import {
  type ArgumentRecord,
  type EngineOptions,
  type FileSystem,
  getProjectRootPathAndPackageManager,
  isGeneratorEmpty,
} from "@codemod-com/utilities";
import { type FileSystemAdapter, glob, globStream } from "fast-glob";
import * as yaml from "js-yaml";
import { Volume, createFsFromVolume } from "memfs";
import { buildFileCommands } from "./buildFileCommands.js";
import { buildFileMap } from "./buildFileMap.js";
import type { Codemod } from "./codemod.js";
import {
  type FormattedFileCommand,
  buildFormattedFileCommands,
  modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { getTransformer, transpile } from "./getTransformer.js";
import { astGrepLanguageToPatterns } from "./runAstgrepCodemod.js";
import { type Dependencies, runRepomod } from "./runRepomod.js";
import { runWorkflowCodemod } from "./runWorkflowCodemod.js";
import type {
  CodemodExecutionErrorCallback,
  PrinterMessageCallback,
} from "./schemata/callbacks.js";
import {
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_VERSION_CONTROL_DIRECTORIES,
  type FlowSettings,
} from "./schemata/flowSettingsSchema.js";
import type { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { WorkerThreadManager } from "./workerThreadManager.js";

const TERMINATE_IDLE_THREADS_TIMEOUT = 30 * 1000;

export const buildPatterns = async (
  flowSettings: FlowSettings,
  codemod: Codemod,
  filemod: Filemod<Dependencies, Record<string, unknown>> | null,
  onPrinterMessage?: PrinterMessageCallback,
): Promise<{
  include: string[];
  exclude: string[];
  userExcluded: string[];
  defaultExcluded: string[];
  gitIgnoreExcluded: string[];
  reason?: string;
}> => {
  const formatFunc = (pattern: string) => {
    let formattedPattern = pattern;

    if (pattern.startsWith("**") || pattern.startsWith("/")) {
      formattedPattern = pattern;
    } else {
      formattedPattern = `**/${pattern}`;
    }

    if (formattedPattern.endsWith("/")) {
      return join(formattedPattern, "**/*.*");
    }

    return formattedPattern;
  };

  const excludePatterns = flowSettings.exclude ?? [];
  const userExcluded = excludePatterns.map(formatFunc);
  const defaultExcluded = DEFAULT_EXCLUDE_PATTERNS.concat(
    DEFAULT_VERSION_CONTROL_DIRECTORIES,
  ).map(formatFunc);

  const allExcluded = userExcluded.concat(defaultExcluded);

  // Approach below traverses for all .gitignores, but it takes too long and will hang the execution in large projects.
  // Instead we just use the utils function to get the root gitignore if it exists. Otherwise, just ignore

  // const gitIgnorePaths = await glob("**/.gitignore", {
  //   cwd: flowSettings.target,
  //   ignore: formattedExclude,
  //   absolute: true,
  // });

  // let gitIgnored: string[] = [];
  // if (gitIgnorePaths.length > 0) {
  //   for (const gitIgnorePath of gitIgnorePaths) {
  //     const gitIgnoreContents = await readFile(gitIgnorePath, "utf-8");
  //     gitIgnored = gitIgnored.concat(
  //       await Promise.all(
  //         gitIgnoreContents
  //           .split("\n")
  //           .map((line) => line.trim())
  //           .filter((line) => line.length > 0 && !line.startsWith("#"))
  //           .map(async (line) => {
  //             const path = join(dirname(gitIgnorePath), line);

  //             try {
  //               const stat = await lstat(path);

  //               if (stat.isDirectory()) {
  //                 return `${path}/**/*.*`;
  //               }
  //             } catch (err) {
  //               //
  //             }

  //             return path;
  //           }),
  //       ),
  //     );
  //   }
  // }

  const { rootPath } = await getProjectRootPathAndPackageManager(
    flowSettings.target,
    true,
  );

  let gitIgnored: string[] = [];
  if (rootPath !== null) {
    try {
      const gitIgnoreContents = await readFile(
        join(rootPath, ".gitignore"),
        "utf-8",
      );

      gitIgnored = gitIgnoreContents
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
        .map(formatFunc);

      allExcluded.push(...gitIgnored);
    } catch (err) {
      //
    }
  }

  let reason: string | undefined;
  let patterns: string[] | undefined = undefined;
  if (flowSettings.include) {
    reason =
      "Using paths provided by user via options (combined with engine defaults)";
    patterns = flowSettings.include;
  } else if (flowSettings.files) {
    reason =
      "Using paths provided by user via options (combined with engine defaults)";
    patterns = flowSettings.files;
  } else if (codemod.include) {
    reason =
      "Using paths provided by codemod settings (combined with engine defaults)";
    patterns = codemod.include;
  }

  // ast-grep only runs on certain file and to oevrride that behaviour we would have to create temporary sgconfig file
  if (codemod.engine === "ast-grep") {
    if (patterns) {
      patterns = undefined;
      reason = "Ignoring include/exclude patterns for ast-grep codemod";
      onPrinterMessage?.({
        kind: "console",
        consoleKind: "log",
        message: reason,
      });
    }

    try {
      const config = yaml.load(
        await readFile(codemod.indexPath, { encoding: "utf8" }),
      ) as { language: string };
      patterns = astGrepLanguageToPatterns[config.language];
    } catch (error) {
      //
    }
  }

  if (!patterns) {
    reason = "Using default include patterns based on the engine";
    patterns = [];
  }

  let engineDefaultPatterns = ["**/*.*"];

  if (codemod.engine === "filemod" && filemod !== null) {
    engineDefaultPatterns = (filemod?.includePatterns as string[]) ?? ["**/*"];
  } else if (
    codemod.engine === "jscodeshift" ||
    codemod.engine === "ts-morph"
  ) {
    engineDefaultPatterns = ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"];
  }

  engineDefaultPatterns = engineDefaultPatterns.filter(
    (p) => !allExcluded.includes(p),
  );

  // remove from included if user is trying to override default include
  const formattedInclude = patterns
    .map(formatFunc)
    .concat(engineDefaultPatterns);

  const exclude = allExcluded.filter((p) => {
    // remove from excluded patterns if user is trying to override default exclude
    if (
      DEFAULT_EXCLUDE_PATTERNS.concat(
        DEFAULT_VERSION_CONTROL_DIRECTORIES,
      ).includes(p)
    ) {
      return !formattedInclude.includes(p);
    }

    return true;
  });

  // remove everything that was excluded from the included patterns
  const include = formattedInclude.filter((p) => !exclude.includes(p));

  return {
    include,
    exclude,
    userExcluded,
    defaultExcluded,
    gitIgnoreExcluded: gitIgnored,
    reason,
  };
};

export const buildPathsGlob = async (
  fileSystem: FileSystem,
  flowSettings: FlowSettings,
  patterns: {
    include: string[];
    exclude: string[];
  },
) => {
  const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

  return glob(patterns.include, {
    absolute: true,
    cwd: flowSettings.target,
    fs: fileSystemAdapter,
    ignore: patterns.exclude,
    onlyFiles: true,
    dot: true,
  });
};

async function* buildPathGlobGenerator(
  fileSystem: FileSystem,
  flowSettings: FlowSettings,
  patterns: {
    include: string[];
    exclude: string[];
  },
): AsyncGenerator<string, void, unknown> {
  const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

  const stream = globStream(patterns.include, {
    absolute: true,
    cwd: flowSettings.target,
    fs: fileSystemAdapter,
    ignore: patterns.exclude,
    onlyFiles: true,
    dot: true,
  });

  for await (const chunk of stream) {
    yield chunk.toString();
  }

  stream.emit("close");
}

function printRunSummary(
  onPrinterMessage: PrinterMessageCallback,
  codemod: Codemod,
  flowSettings: FlowSettings,
  patterns: Awaited<ReturnType<typeof buildPatterns>>,
) {
  let runningCodemodVersion = "";
  let runningCodemodName = "";

  if (codemod.bundleType !== "standalone") {
    runningCodemodVersion += `@${codemod.version}`;
    runningCodemodName = codemod.name;
  } else {
    runningCodemodVersion += " (standalone)";
    runningCodemodName = codemod.indexPath;
  }

  if (codemod.engine === "workflow") {
    onPrinterMessage({
      kind: "console",
      consoleKind: "info",
      message: boxen(
        chalk.cyan(
          `Codemod:`,
          chalk.bold(`${runningCodemodName}${runningCodemodVersion}`),
          codemod.source === "local"
            ? chalk.bold("\nRunning from local filesystem")
            : "",
          "\nTarget:",
          chalk.bold(flowSettings.target),
        ),
        {
          padding: 2,
          dimBorder: true,
          textAlignment: "left",
          borderColor: "blue",
          borderStyle: "round",
        },
      ),
    });

    return;
  }

  const { include, defaultExcluded, gitIgnoreExcluded, userExcluded, reason } =
    patterns;

  onPrinterMessage({
    kind: "console",
    consoleKind: "info",
    message: boxen(
      chalk.cyan(
        `Codemod:`,
        chalk.bold(`${runningCodemodName}${runningCodemodVersion}`),
        codemod.source === "local"
          ? chalk.bold("\nRunning from local filesystem")
          : "",
        "\nTarget:",
        chalk.bold(flowSettings.target),
        "\n",
        chalk.yellow(reason ? `\n${reason}` : ""),
        chalk.green("\nIncluded patterns:"),
        colorLongString(include.join(", "), chalk.green.bold),
        ...(userExcluded.length > 0
          ? [
              chalk.red("\nPatterns excluded manually:"),
              colorLongString(userExcluded.join(", "), chalk.red.bold),
            ]
          : []),
        ...(defaultExcluded.length > 0
          ? [
              chalk.red("\nPatterns excluded by default:"),
              colorLongString(defaultExcluded.join(", "), chalk.red.bold),
            ]
          : []),
        ...(gitIgnoreExcluded.length > 0
          ? [
              chalk.red("\nPatterns excluded from gitignore:"),
              colorLongString(gitIgnoreExcluded.join(", "), chalk.red.bold),
            ]
          : []),
        "\n",
        chalk.yellow(
          !flowSettings.install ? "\nDependency installation disabled" : "",
        ),
        chalk.yellow(`\nRunning in ${flowSettings.threads} threads`),
        chalk.yellow(!flowSettings.format ? "\nFile formatting disabled" : ""),
      ),
      {
        padding: 2,
        dimBorder: true,
        textAlignment: "left",
        borderColor: "blue",
        borderStyle: "round",
      },
    ),
  });
}

export const runCodemod = async (
  fileSystem: FileSystem,
  codemod: Codemod,
  flowSettings: FlowSettings,
  runSettings: RunSettings,
  onCommand: (command: FormattedFileCommand) => Promise<void>,
  onPrinterMessage: PrinterMessageCallback,
  safeArgumentRecord: ArgumentRecord,
  engineOptions: EngineOptions | null,
  onCodemodError: CodemodExecutionErrorCallback,
): Promise<void> => {
  if (codemod.engine === "piranha") {
    throw new Error("Piranha not supported");
  }

  const pathsAreEmpty = () =>
    onPrinterMessage({
      kind: "console",
      consoleKind: "error",
      message: chalk.yellow(
        `No files to process were found in ${
          flowSettings.target
            ? "specified target directory"
            : "current working directory"
        }. Exiting...`,
      ),
    });

  if (codemod.engine === "recipe") {
    if (!runSettings.dryRun) {
      for (let i = 0; i < codemod.codemods.length; ++i) {
        const commands: FormattedFileCommand[] = [];

        // biome-ignore lint: assertion is correct
        const subCodemod = codemod.codemods[i]!;

        await runCodemod(
          fileSystem,
          subCodemod,
          flowSettings,
          runSettings,
          async (command) => {
            commands.push(command);
          },
          (message) => {
            if (message.kind === "progress") {
              onPrinterMessage({
                kind: "progress",
                codemodName:
                  subCodemod.bundleType === "package"
                    ? subCodemod.name
                    : undefined,
                processedFileNumber:
                  message.totalFileNumber * i + message.processedFileNumber,
                totalFileNumber:
                  message.totalFileNumber * codemod.codemods.length,
                processedFileName: message.processedFileName,
              });
            }

            onPrinterMessage(message);
          },
          safeArgumentRecord,
          engineOptions,
          onCodemodError,
        );

        for (const command of commands) {
          await onCommand(command);
          await modifyFileSystemUponCommand(fileSystem, runSettings, command);
        }
      }

      return;
    }

    const mfs = createFsFromVolume(Volume.fromJSON({}));

    const patterns = await buildPatterns(
      flowSettings,
      codemod,
      null,
      onPrinterMessage,
    );

    const paths = await buildPathsGlob(fileSystem, flowSettings, patterns);

    if (paths.length === 0) {
      return pathsAreEmpty();
    }

    const fileMap = await buildFileMap(fileSystem, mfs, paths);

    const deletedPaths: string[] = [];

    for (let i = 0; i < codemod.codemods.length; ++i) {
      // biome-ignore lint: assertion is correct
      const subCodemod = codemod.codemods[i]!;

      const commands: FormattedFileCommand[] = [];

      await runCodemod(
        mfs,
        subCodemod,
        flowSettings,
        {
          dryRun: false,
          caseHashDigest: runSettings.caseHashDigest,
        },
        async (command) => {
          commands.push(command);
        },
        (message) => {
          if (message.kind === "progress") {
            onPrinterMessage({
              kind: "progress",
              codemodName:
                subCodemod.bundleType === "package"
                  ? subCodemod.name
                  : undefined,
              processedFileNumber:
                message.totalFileNumber * i + message.processedFileNumber,
              totalFileNumber:
                message.totalFileNumber * codemod.codemods.length,
              processedFileName: message.processedFileName,
            });
          }

          onPrinterMessage(message);
        },
        safeArgumentRecord,
        engineOptions,
        onCodemodError,
      );

      for (const command of commands) {
        if (command.kind === "deleteFile") {
          deletedPaths.push(command.oldPath);
        }

        await modifyFileSystemUponCommand(
          mfs,
          {
            dryRun: false,
            caseHashDigest: runSettings.caseHashDigest,
          },
          command,
        );
      }
    }

    const fileCommands = await buildFileCommands(
      fileMap,
      paths,
      deletedPaths,
      mfs,
    );

    const commands = await buildFormattedFileCommands(fileCommands);

    for (const command of commands) {
      await onCommand(command);
    }

    return;
  }

  if (codemod.engine === "workflow") {
    printRunSummary(onPrinterMessage, codemod, flowSettings, {
      include: ["**/*.*"],
      exclude: [],
      defaultExcluded: [],
      gitIgnoreExcluded: [],
      userExcluded: [],
    });

    const codemodSource = await readFile(codemod.indexPath, {
      encoding: "utf8",
    });
    const transpiledSource = codemod.indexPath.endsWith(".ts")
      ? transpile(codemodSource.toString())
      : codemodSource.toString();
    await runWorkflowCodemod(transpiledSource, safeArgumentRecord, console.log);

    return;
  }

  const codemodSource = await readFile(codemod.indexPath, { encoding: "utf8" });

  const transpiledSource = codemod.indexPath.endsWith(".ts")
    ? transpile(codemodSource.toString())
    : codemodSource.toString();

  if (codemod.engine === "filemod") {
    const transformer = getTransformer(transpiledSource);

    if (transformer === null) {
      throw new Error(
        `The transformer cannot be null: ${codemod.indexPath} ${codemod.engine}`,
      );
    }

    const patterns = await buildPatterns(
      flowSettings,
      codemod,
      transformer as Filemod<Dependencies, Record<string, unknown>>,
      onPrinterMessage,
    );

    const globPaths = await buildPathsGlob(fileSystem, flowSettings, patterns);

    if (globPaths.length === 0) {
      return pathsAreEmpty();
    }

    printRunSummary(onPrinterMessage, codemod, flowSettings, patterns);

    const fileCommands = await runRepomod(
      fileSystem,
      {
        ...transformer,
        includePatterns: globPaths,
        excludePatterns: [],
        name: codemod.bundleType === "package" ? codemod.name : undefined,
      },
      flowSettings.target,
      flowSettings.format,
      safeArgumentRecord,
      onPrinterMessage,
      onCodemodError,
    );

    const commands = await buildFormattedFileCommands(fileCommands);

    for (const command of commands) {
      await onCommand(command);
    }

    return;
  }

  // jscodeshift or ts-morph or ast-grep
  const patterns = await buildPatterns(
    flowSettings,
    codemod,
    null,
    onPrinterMessage,
  );

  const pathGeneratorInitializer = () =>
    buildPathGlobGenerator(fileSystem, flowSettings, patterns);

  if (await isGeneratorEmpty(pathGeneratorInitializer)) {
    return pathsAreEmpty();
  }

  const pathGenerator = pathGeneratorInitializer();

  const { engine } = codemod;

  printRunSummary(onPrinterMessage, codemod, flowSettings, patterns);

  await new Promise<void>((resolve) => {
    let timeout: NodeJS.Timeout | null = null;

    const workerThreadManager = new WorkerThreadManager(
      flowSettings.threads,
      async (path) => {
        const data = await fileSystem.promises.readFile(path, {
          encoding: "utf8",
        });

        return data as string;
      },
      (message) => {
        if (message.kind === "progress") {
          onPrinterMessage({
            kind: "progress",
            codemodName:
              codemod.bundleType === "package" ? codemod.name : undefined,
            processedFileNumber: message.processedFileNumber,
            totalFileNumber: message.totalFileNumber,
            processedFileName: message.processedFileName
              ? relative(flowSettings.target, message.processedFileName)
              : null,
          });
        } else {
          onPrinterMessage(message);
        }

        if (timeout) {
          clearTimeout(timeout);
        }

        if (message.kind === "finish") {
          resolve();

          return;
        }

        timeout = setTimeout(async () => {
          await workerThreadManager.terminateWorkers();

          resolve();
        }, TERMINATE_IDLE_THREADS_TIMEOUT);
      },
      onCommand,
      pathGenerator,
      codemod.indexPath,
      engine,
      transpiledSource,
      flowSettings.format,
      safeArgumentRecord,
      engineOptions,
      (error) => {
        onCodemodError({
          codemodName:
            codemod.bundleType === "package" ? codemod.name : "Local codemod",
          ...error,
        });
      },
    );
  });
};
