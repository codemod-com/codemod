import type * as INodeFs from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { join as joinPosix } from "node:path/posix";

import { glob, globStream } from "glob";
import * as yaml from "js-yaml";

import type { Filemod } from "@codemod-com/filemod";
import {
  Printer,
  type PrinterBlueprint,
  boxen,
  chalk,
  colorLongString,
} from "@codemod-com/printer";
import {
  type Codemod,
  type CodemodConfig,
  type FileCommand,
  type FileSystem,
  type KnownEnginesCodemod,
  type RunResult,
  getProjectRootPathAndPackageManager,
  isGeneratorEmpty,
  isNeitherNullNorUndefined,
  isRecipeCodemod,
} from "@codemod-com/utilities";

import { astGrepLanguageToPatterns } from "./engines/ast-grep.js";
import type { Dependencies } from "./engines/filemod.js";
import { runRepomod } from "./engines/filemod.js";
import { runWorkflowCodemod } from "./engines/workflow.js";
import type {
  CodemodExecutionError,
  CodemodExecutionErrorCallback,
} from "./schemata/callbacks.js";
import {
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_VERSION_CONTROL_DIRECTORIES,
  type FlowSettings,
} from "./schemata/flowSettingsSchema.js";
import { getCodemodSourceCode, getTransformer } from "./source-code.js";
import { WorkerManager } from "./worker-manager.js";

const TERMINATE_IDLE_THREADS_TIMEOUT = 30 * 1000;

export class Runner {
  public constructor(
    protected readonly _options: {
      readonly fs: FileSystem;
      readonly flowSettings: FlowSettings;
    },
  ) {}

  public async run(options: {
    codemod: Codemod;
    onSuccess?: (runResult: RunResult) => Promise<void> | void;
    onFailure?: (error: Error) => Promise<void> | void;
  }) {
    const { codemod, onSuccess, onFailure } = options;

    const executionErrors: CodemodExecutionError[] = [];
    const printer = new Printer();

    console.log("Running codemod", codemod);

    try {
      await this.executeCodemod({
        fileSystem: this._options.fs,
        codemod,
        flowSettings: this._options.flowSettings,
        onCommand: async (command) =>
          this.modifyFileSystemUponCommand(this._options.fs, command),
        onError: (error) => executionErrors.push(error),
        onSuccess,
        printer,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        return;
      }

      await onFailure?.(error);
    }

    return executionErrors;
  }

  private async buildPatterns(
    flowSettings: FlowSettings,
    codemod: Codemod,
    filemod: Filemod<Dependencies, Record<string, unknown>> | null,
  ): Promise<{
    include: string[];
    exclude: string[];
    userExcluded: string[];
    defaultExcluded: string[];
    gitIgnoreExcluded: string[];
    reason?: string;
  }> {
    const formatFunc = (pattern: string) => {
      let formattedPattern = pattern;

      if (pattern.includes("./")) {
        return pattern;
      }

      if (pattern.startsWith("**") || pattern.startsWith("/")) {
        formattedPattern = pattern;
      } else {
        formattedPattern = `**/${pattern}`;
      }

      if (formattedPattern.endsWith("/")) {
        // patterns should always be posix style, even for Win
        return joinPosix(formattedPattern, "**/*.*");
      }

      return formattedPattern;
    };

    const excludePatterns = flowSettings.exclude;
    const userExcluded = [...new Set(excludePatterns.map(formatFunc))];
    const defaultExcluded = [
      ...new Set(
        DEFAULT_EXCLUDE_PATTERNS.concat(
          DEFAULT_VERSION_CONTROL_DIRECTORIES,
        ).map(formatFunc),
      ),
    ];
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

        allExcluded.push(...new Set(gitIgnored));
      } catch (err) {
        //
      }
    }

    let reason: string | undefined;
    const patterns: string[] = [];

    if (flowSettings.include || flowSettings.files) {
      reason = "Using paths provided by user via options";
      patterns.push(
        ...(flowSettings.include ?? []),
        ...(flowSettings.files ?? []),
      );
    } else if (codemod.config.include) {
      reason = "Using paths provided by codemod settings";
      patterns.push(...codemod.config.include);
    }

    // ast-grep only runs on certain file and to override that behaviour we would have to create temporary sgconfig file
    if (codemod.config.engine === "ast-grep") {
      if (patterns) {
        patterns.splice(0, patterns.length);
        reason = "Using patterns defined by selected ast-grep language";
      }

      try {
        const configs = yaml.loadAll(
          await readFile(codemod.path, { encoding: "utf8" }),
        ) as { language?: string }[];

        configs.forEach((config, i) => {
          if (!config.language) {
            throw new Error(
              `Rule${
                configs.length > 1 ? ` at index ${i}` : ""
              } does not have a language configured.`,
            );
          }

          const astGrepPatterns = astGrepLanguageToPatterns[config.language];
          if (!astGrepPatterns) {
            throw new Error(
              "Unsupported ast-grep language specified in rule configuration file",
            );
          }

          patterns.push(...astGrepPatterns);
        });
      } catch (error) {
        throw new Error(
          `Unable to load config file for ast-grep codemod at ${codemod.path}: ${error}`,
        );
      }
    }

    if (
      codemod.config.engine === "filemod" &&
      isNeitherNullNorUndefined(filemod) &&
      isNeitherNullNorUndefined(filemod.includePatterns) &&
      filemod.includePatterns.length > 0
    ) {
      reason = "Using include patterns from filemod configuration";
      patterns.push(...filemod.includePatterns);
    }

    if (patterns.length === 0) {
      reason = "Using default include patterns based on the engine";

      patterns.push(
        ...(codemod.config.engine === "jscodeshift" ||
        codemod.config.engine === "ts-morph"
          ? [
              "**/*.js",
              "**/*.jsx",
              "**/*.ts",
              "**/*.tsx",
              "**/*.vue",
              "**/*.svelte",
            ]
          : ["**/*.*"]),
      );
    }

    const formattedInclude = patterns.map(formatFunc);

    const excludeFilterFunc = (p: string) => {
      // remove from excluded patterns if user is trying to override default exclude
      if (defaultExcluded.includes(p) || gitIgnored.includes(p)) {
        return !formattedInclude.includes(p);
      }

      return true;
    };

    const exclude = allExcluded.filter(excludeFilterFunc);
    // remove everything that was excluded from the included patterns
    const include = formattedInclude.filter((p) => !exclude.includes(p));

    return {
      include: [...new Set(include)],
      exclude: [...new Set(exclude)],
      userExcluded: userExcluded.filter(excludeFilterFunc),
      defaultExcluded: defaultExcluded.filter(excludeFilterFunc),
      gitIgnoreExcluded: gitIgnored.filter(excludeFilterFunc),
      reason,
    };
  }

  private async buildPathsGlob(
    fileSystem: FileSystem,
    flowSettings: FlowSettings,
    patterns: {
      include: string[];
      exclude: string[];
    },
  ) {
    return glob(patterns.include, {
      absolute: true,
      cwd: flowSettings.target,
      fs: fileSystem as typeof INodeFs,
      ignore: patterns.exclude,
      nodir: true,
      dot: true,
    });
  }

  private async *buildPathGlobGenerator(
    fileSystem: FileSystem,
    flowSettings: FlowSettings,
    patterns: {
      include: string[];
      exclude: string[];
    },
  ): AsyncGenerator<string, void, unknown> {
    const stream = globStream(patterns.include, {
      absolute: true,
      cwd: flowSettings.target,
      fs: fileSystem as typeof INodeFs,
      ignore: patterns.exclude,
      nodir: true,
      dot: true,
    });

    for await (const chunk of stream) {
      yield chunk.toString();
    }

    stream.emit("close");
  }

  private async printRunSummary(
    printer: PrinterBlueprint,
    codemod: Codemod,
    flowSettings: FlowSettings,
    patterns: Awaited<ReturnType<typeof this.buildPatterns>>,
  ) {
    const { name, version, engine } = codemod.config;
    const fullCodemodName = `${name}${version ? `@${version}` : ""}`;

    if (engine === "workflow") {
      printer.printMessage({
        kind: "console",
        consoleKind: "info",
        message: boxen(
          chalk.cyan(
            `Codemod:`,
            chalk.bold(fullCodemodName),
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

    const {
      include,
      defaultExcluded,
      gitIgnoreExcluded,
      userExcluded,
      reason,
    } = patterns;

    printer.printMessage({
      kind: "console",
      consoleKind: "info",
      message: boxen(
        chalk.cyan(
          `Codemod:`,
          chalk.bold(fullCodemodName),
          "\nTarget:",
          chalk.bold(flowSettings.target),
          "\n",
          chalk.yellow(reason ? `\n${reason}` : ""),
          chalk.yellow("\nIncluded patterns:"),
          colorLongString(include.join(", "), chalk.green.bold),
          ...(userExcluded.length > 0
            ? [
                chalk.yellow("\nPatterns excluded manually:"),
                colorLongString(userExcluded.join(", "), chalk.yellow.bold),
              ]
            : []),
          ...(defaultExcluded.length > 0
            ? [
                chalk.yellow("\nPatterns excluded by default:"),
                colorLongString(defaultExcluded.join(", "), chalk.yellow.bold),
              ]
            : []),
          ...(gitIgnoreExcluded.length > 0
            ? [
                chalk.yellow("\nPatterns excluded from gitignore:"),
                colorLongString(
                  gitIgnoreExcluded.join(", "),
                  chalk.yellow.bold,
                ),
              ]
            : []),
          "\n",
          chalk.yellow(
            !flowSettings.install ? "\nDependency installation disabled" : "",
          ),
          chalk.yellow(`\nRunning in ${flowSettings.threads} threads`),
          chalk.yellow(
            !flowSettings.format ? "\nFile formatting disabled" : "",
          ),
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

  private async executeCodemod(options: {
    fileSystem: FileSystem;
    codemod: Codemod;
    flowSettings: FlowSettings;
    onCommand: (command: FileCommand) => Promise<void>;
    onSuccess?: (runResult: RunResult) => Promise<void> | void;
    onError?: CodemodExecutionErrorCallback;
    printer: PrinterBlueprint;
  }): Promise<void> {
    const {
      fileSystem,
      codemod,
      flowSettings,
      onCommand,
      onError,
      onSuccess,
      printer,
    } = options;

    const pathsAreEmpty = () =>
      printer.printMessage({
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

    if (isRecipeCodemod(codemod)) {
      for (const subCodemod of codemod.codemods) {
        const commands: FileCommand[] = [];

        await this.executeCodemod({
          ...options,
          codemod: subCodemod,
          onCommand: async (command) => {
            commands.push(command);
            await onCommand(command);
          },
        });

        // run onSuccess after each codemod
        await onSuccess?.({ codemod: subCodemod, commands });
      }

      // run onSuccess for recipe itself
      return await onSuccess?.({
        codemod,
        commands: [],
      });
    }

    const codemodSource = await getCodemodSourceCode(codemod.path);

    if (codemod.config.engine === "workflow") {
      this.printRunSummary(printer, codemod, flowSettings, {
        include: ["**/*.*"],
        exclude: [],
        defaultExcluded: [],
        gitIgnoreExcluded: [],
        userExcluded: [],
      });

      await runWorkflowCodemod(
        codemodSource,
        codemod.safeArgumentRecord,
        (kind, message) => {
          printer.printMessage({ kind: "console", message, consoleKind: kind });
        },
      );

      // @TODO pass modified paths?
      return await onSuccess?.({ codemod, commands: [] });
    }

    if (codemod.config.engine === "filemod") {
      const transformer = getTransformer(codemodSource);

      if (transformer === null) {
        throw new Error(
          `The transformer cannot be null: ${codemod.path} ${codemod.config.engine}`,
        );
      }

      const patterns = await this.buildPatterns(
        flowSettings,
        codemod,
        transformer as Filemod<Dependencies, Record<string, unknown>>,
      );

      const globPaths = await this.buildPathsGlob(
        fileSystem,
        flowSettings,
        patterns,
      );

      if (globPaths.length === 0) {
        return pathsAreEmpty();
      }

      this.printRunSummary(printer, codemod, flowSettings, patterns);

      const commands = await runRepomod({
        fileSystem,
        filemod: {
          ...transformer,
          includePatterns: globPaths,
          excludePatterns: [],
          name: codemod.config.name,
        },
        safeArgumentRecord: codemod.safeArgumentRecord,
        printer,
        onError,
        ...flowSettings,
      });

      // const commands = await buildFormattedFileCommands(fileCommands);

      for (const command of commands) {
        await onCommand(command);
      }

      return await onSuccess?.({ codemod, commands: [...commands] });
    }

    // jscodeshift or ts-morph or ast-grep
    const patterns = await this.buildPatterns(flowSettings, codemod, null);

    const pathGeneratorInitializer = () =>
      this.buildPathGlobGenerator(fileSystem, flowSettings, patterns);
    if (await isGeneratorEmpty(pathGeneratorInitializer)) {
      return pathsAreEmpty();
    }
    const pathGenerator = pathGeneratorInitializer();

    this.printRunSummary(printer, codemod, flowSettings, patterns);

    const commands: FileCommand[] = [];
    await new Promise<void>((resolve) => {
      let timeout: NodeJS.Timeout | null = null;

      const workerThreadManager = new WorkerManager({
        fileSystem,
        flowSettings,
        onPrinterMessage: (message) => {
          printer.printMessage(message);

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
        onCommand: async (command) => {
          commands.push(command);
          await onCommand(command);
        },
        pathGenerator,
        codemod: codemod as KnownEnginesCodemod & {
          config: CodemodConfig & {
            engine: "jscodeshift" | "ts-morph" | "ast-grep";
          };
        },
        codemodSource,
        onError,
      });
    });

    return await onSuccess?.({ codemod, commands });
  }

  private async modifyFileSystemUponCommand(
    fileSystem: FileSystem,
    command: FileCommand,
  ): Promise<void> {
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
  }
}
