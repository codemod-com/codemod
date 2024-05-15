import { Printer, boxen, chalk } from "@codemod-com/printer";
import {
  NullSender,
  PostHogSender,
  type TelemetrySender,
} from "@codemod-com/telemetry";
import { doubleQuotify, execPromise } from "@codemod-com/utilities";
import Axios from "axios";
import semver from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "../package.json";
import { getUserDistinctId } from "./analytics/distinctId";
import type { TelemetryEvent } from "./analytics/telemetry";
import { buildGlobalOptions, buildRunOptions } from "./buildOptions.js";
import { handleInitCliCommand } from "./commands/init";
import { handleLearnCliCommand } from "./commands/learn";
import { handleListNamesCommand } from "./commands/list";
import { handleLoginCliCommand } from "./commands/login";
import { handleLogoutCliCommand } from "./commands/logout";
import { handlePublishCliCommand } from "./commands/publish";
import { handleRunCliCommand } from "./commands/run";
import { handleUnpublishCliCommand } from "./commands/unpublish";
import { handleWhoAmICommand } from "./commands/whoami";
import { initGlobalNodeModules } from "./utils";

const checkLatestVersion = async () => {
  try {
    const latestCLIVersion = semver.coerce(
      (await execPromise("npm view codemod version")).stdout.trim(),
    )?.version;

    if (latestCLIVersion && semver.gt(latestCLIVersion, version)) {
      console.log(
        boxen(
          chalk(
            "Update available",
            chalk.dim(version),
            ">",
            chalk.green(latestCLIVersion),
            "\n\nRun",
            chalk.bold.cyan(doubleQuotify("npm i -g codemod@latest")),
            "to upgrade",
          ),
          {
            padding: 1,
            textAlignment: "center",
            borderColor: "yellowBright",
            borderStyle: "round",
          },
        ),
      );
    }
  } catch (err) {
    // npm is not installed?
  }
};

const initializeDependencies = async (argv: {
  clientIdentifier: string | undefined;
  json: boolean;
  telemetryDisable: boolean | undefined;
}) => {
  // client identifier is required to prevent duplicated tracking of events
  // we can specify that request is coming from the VSCE or other client
  const clientIdentifier =
    typeof argv.clientIdentifier === "string" ? argv.clientIdentifier : "CLI";

  Axios.interceptors.request.use((config) => {
    config.headers["X-Client-Identifier"] = clientIdentifier;

    return config;
  });

  const printer = new Printer(argv.json);

  const telemetryService: TelemetrySender<TelemetryEvent> =
    argv.telemetryDisable
      ? new NullSender()
      : new PostHogSender({
          cloudRole: clientIdentifier,
          distinctId: await getUserDistinctId(),
        });

  const exit = async () => {
    // appInsights telemetry client uses batches to send telemetry.
    // this means that it waits for some timeout (default = 15000) to collect multiple telemetry events (envelopes) and then sends them in single batch
    // see Channel2.prototype.send
    // we need to flush all buffered events before exiting the process, otherwise all scheduled events will be lost
    await telemetryService.dispose();
    process.exit(0);
  };

  const executeCliCommand = async (
    executableCallback: () => Promise<unknown> | unknown,
  ) => {
    try {
      await executableCallback();
    } catch (error) {
      if (!(error instanceof Error)) {
        return;
      }

      printer.printOperationMessage({
        kind: "error",
        message: error.message,
      });
    }

    exit();
  };

  return {
    printer,
    telemetryService,
    exit,
    executeCliCommand,
  };
};

export const executeMainThread = async () => {
  await checkLatestVersion();

  const slicedArgv = hideBin(process.argv);

  const argvObject = buildGlobalOptions(
    yargs(slicedArgv).help().version(version),
  );

  argvObject
    .scriptName("codemod")
    .usage("Usage: <command> [options]")
    .command(
      "*",
      "runs a codemod or recipe",
      (y) => buildRunOptions(y),
      async (args) => {
        const { printer, telemetryService, executeCliCommand } =
          await initializeDependencies(args);

        executeCliCommand(() =>
          handleRunCliCommand(printer, args, telemetryService),
        );
      },
    )
    // TODO: improve and remove the need for this command
    .command(
      "runOnPreCommit [files...]",
      "run pre-commit codemods against staged files passed positionally",
      (y) => buildRunOptions(y),
      async (args) => {
        const { executeCliCommand, printer, telemetryService } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleRunCliCommand(printer, args, telemetryService),
        );
      },
    )
    .command(
      ["list", "ls", "search"],
      "lists all the codemods & recipes in the public registry. can be used to search by name and tags",
      (y) => buildGlobalOptions(y),
      async (args) => {
        const searchTerm = args._.length > 1 ? String(args._.at(-1)) : null;

        if (searchTerm) {
          if (searchTerm.length < 2) {
            throw new Error(
              "Search term must be at least 2 characters long. Aborting...",
            );
          }
        }

        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleListNamesCommand(printer, searchTerm),
        );
      },
    )
    .command(
      "learn",
      "exports the current `git diff` in a file to before/after panels in the Codemod Studio",
      (y) =>
        buildGlobalOptions(y).option("target", {
          alias: "t",
          type: "string",
          description: "path to the file to be learned",
        }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleLearnCliCommand(printer, args.target ?? null),
        );
      },
    )
    .command(
      "login",
      "logs in through authentication in the Codemod Studio",
      (y) => buildGlobalOptions(y),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleLoginCliCommand(printer));
      },
    )
    .command(
      "logout",
      "logs out",
      (y) => buildGlobalOptions(y),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleLogoutCliCommand(printer));
      },
    )
    .command(
      "whoami",
      "prints the user data of currently logged in user",
      (y) => buildGlobalOptions(y),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleWhoAmICommand(printer));
      },
    )
    .command(
      "build",
      "build the JavaScript engine codemod (requires global esbuild installation)",
      (y) =>
        buildGlobalOptions(y).option("source", {
          alias: "s",
          type: "string",
          description: "path to the codemod to be built",
        }),
      async (args) => {
        const { executeCliCommand, exit, printer } =
          await initializeDependencies(args);

        await initGlobalNodeModules();

        try {
          await execPromise("esbuild --version");
        } catch (error) {
          printer.printOperationMessage({
            kind: "error",
            message: `To build packages using codemod CLI, esbuild has to be globally installed using your package manager. Please run ${doubleQuotify(
              "npm i -g esbuild",
            )}`,
          });

          return exit();
        }

        const { handleBuildCliCommand } = await import("./commands/build.js");

        return executeCliCommand(() =>
          handleBuildCliCommand(printer, args.source ?? process.cwd()),
        );
      },
    )
    .command(
      "publish",
      "publish the codemod to Codemod Registry",
      (y) =>
        buildGlobalOptions(y).option("source", {
          type: "string",
          description: "path to the codemod to be published",
        }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handlePublishCliCommand(printer, args.source ?? process.cwd()),
        );
      },
    )
    .command(
      "unpublish",
      "unpublish previously published codemod from Codemod Registry",
      (y) =>
        buildGlobalOptions(y).option("force", {
          type: "boolean",
          alias: "f",
          boolean: true,
          description: "whether to remove all versions",
        }),
      async (args) => {
        const lastArgument = args._.length > 1 ? String(args._.at(-1)) : null;

        const { executeCliCommand, printer, exit } =
          await initializeDependencies(args);

        if (!lastArgument) {
          printer.printOperationMessage({
            kind: "error",
            message:
              "You must provide the name of the codemod to unpublish. Aborting...",
          });

          return exit();
        }

        return executeCliCommand(() =>
          handleUnpublishCliCommand(printer, lastArgument, args.force),
        );
      },
    )
    .command(
      "init",
      "initialize a codemod package",
      (y) =>
        buildGlobalOptions(y)
          .option("target", {
            alias: "t",
            type: "string",
            description: "Path to init codemod in",
            default: process.cwd(),
          })
          .option("no-prompt", {
            alias: "y",
            type: "boolean",
            description: "skip all prompts and use default values",
          }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleInitCliCommand({
            printer,
            noPrompt: args.noPrompt,
            target: args.target,
          }),
        );
      },
    );

  if (slicedArgv.length === 0) {
    return argvObject.showHelp();
  }

  const argv = await argvObject.parse();

  {
    const { exit } = await initializeDependencies(argv);
    process.on("SIGINT", exit);
  }
};
