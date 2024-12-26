import Axios from "axios";
import semver from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Printer, boxen, chalk } from "@codemod-com/printer";
import {
  NullSender,
  PostHogSender,
  type TelemetrySender,
} from "@codemod-com/telemetry";
import { doubleQuotify, execPromise } from "@codemod-com/utilities";
import { version } from "#/../package.json";
import {
  handleCreateAPIKeyCommand,
  handleDeleteAPIKeysCommand,
  handleListAPIKeysCommand,
} from "#commands/api-keys.js";
import { handleFeedbackCommand } from "#commands/feedback.js";
import { handleInitCliCommand } from "#commands/init.js";
import { handleLearnCliCommand } from "#commands/learn.js";
import { handleListNamesCommand } from "#commands/list.js";
import { handleLoginCliCommand } from "#commands/login.js";
import { handleLogoutCliCommand } from "#commands/logout.js";
import { handlePublishCliCommand } from "#commands/publish.js";
import { handleRunCliCommand } from "#commands/run.js";
import { handleUnpublishCliCommand } from "#commands/unpublish.js";
import { handleWhoAmICommand } from "#commands/whoami.js";
import { buildGlobalOptions, buildRunOptions } from "#flags.js";
import { type TelemetryEvent, getUserDistinctId } from "#telemetry.js";

const checkLatestVersion = async () => {
  try {
    const npmViewOutput = (
      await execPromise("npm view codemod version", { timeout: 3000 })
    ).stdout.trim();
    const latestCLIVersion = semver.coerce(npmViewOutput)?.version;

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
  telemetry: boolean;
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
    process.env.IGNORE_TELEMETRY === false && argv.telemetry
      ? new PostHogSender({
          cloudRole: clientIdentifier,
          distinctId: await getUserDistinctId(),
        })
      : new NullSender();

  const executeCliCommand = async (
    executableCallback: () => Promise<unknown> | unknown,
    omitExit?: boolean,
  ) => {
    try {
      await executableCallback();
    } catch (error) {
      await telemetryService.dispose();

      if (!(error instanceof Error)) {
        return process.exit(0);
      }

      printer.printOperationMessage({
        kind: "error",
        message: error.message,
      });
    }

    // telemetry client uses batches to send telemetry.
    // we need to flush all buffered events before exiting the process, otherwise all scheduled events will be lost
    await telemetryService.dispose();

    if (!omitExit) {
      return process.exit(0);
    }
  };

  return {
    printer,
    telemetryService,
    exit: process.exit.bind(null, 0),
    executeCliCommand,
  };
};

export const main = async () => {
  await checkLatestVersion();

  const slicedArgv = hideBin(process.argv);

  const argvObject = buildGlobalOptions(
    yargs(slicedArgv).help().version(false),
  );

  argvObject.wrap(argvObject.terminalWidth());

  if (
    (slicedArgv.includes("--version") || slicedArgv.includes("-v")) &&
    slicedArgv.length === 1
  ) {
    return console.log(version);
  }

  argvObject
    .scriptName("codemod")
    .usage("Usage: <command> [options]")
    .command(
      "*",
      "runs a codemod or recipe",
      (y) => buildRunOptions(y),
      async (args) => {
        const { printer, telemetryService, executeCliCommand, exit } =
          await initializeDependencies(args);

        return executeCliCommand(
          () =>
            handleRunCliCommand({
              printer,
              args,
              telemetry: telemetryService,
              onExit: exit,
            }),
          true,
        );
      },
    )
    .command(
      ["list", "ls", "search"],
      "lists all the codemods & recipes in the public registry. can be used to search by name and tags",
      (y) =>
        y
          .option("mine", {
            type: "boolean",
            default: false,
            description: "list only the codemods created by the logged in user",
          })
          .option("all", {
            type: "boolean",
            default: false,
            description:
              "include all of the codemods in the list (including hidden)",
          }),
      async (args) => {
        const searchTerm = args._.length > 1 ? String(args._.at(-1)) : null;

        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleListNamesCommand({
            printer,
            search: searchTerm,
            all: args.all,
            mine: args.mine,
          }),
        );
      },
    )
    .command(
      "learn",
      "exports the current `git diff` in a file to before/after panels in the Codemod Studio",
      (y) =>
        y.option("target", {
          alias: "t",
          type: "string",
          description: "path to the file to be learned",
        }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleLearnCliCommand({
            printer,
            target: args.target ?? null,
          }),
        );
      },
    )
    .command(
      "login",
      "logs in through authentication in the Codemod Studio",
      (y) => y,
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleLoginCliCommand({ printer }));
      },
    )
    .command(
      "logout",
      "logs out",
      (y) => y,
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleLogoutCliCommand({ printer }));
      },
    )
    .command(
      "whoami",
      "prints the user data of currently logged in user",
      (y) => y,
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleWhoAmICommand({ printer }));
      },
    )
    .command(
      "api-keys:create",
      "create a new API key",
      (y) =>
        y
          .option("name", {
            type: "string",
            description:
              "A way to easily identify the key by giving it a name.",
            demandOption: false,
          })
          .option("expiresAt", {
            type: "string",
            description:
              "The date and time when the key will expire. Format: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format",
            demandOption: false,
          }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(async () => {
          await handleCreateAPIKeyCommand({
            printer,
            data: {
              name: args.name,
              expiresAt: args.expiresAt,
            },
          });
        });
      },
    )
    .command(
      "api-keys:list",
      "list API keys",
      (y) => y,
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(async () => {
          await handleListAPIKeysCommand({
            printer,
          });
        });
      },
    )
    .command(
      "api-keys:delete",
      "list API keys",
      (y) =>
        y.option("id", {
          type: "string",
          description: "Key id",
          demandOption: true,
        }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(async () => {
          await handleDeleteAPIKeysCommand({
            printer,
            data: { uuid: args.id },
          });
        });
      },
    )
    .command(
      "publish",
      "publish the codemod to Codemod Registry",
      (y) =>
        y
          .option("source", {
            type: "string",
            description: "path to the codemod to be published",
          })
          .option("namespace", {
            type: "string",
            description: "namespace to publish the codemod under",
            demandOption: false,
          }),
      async (args) => {
        const { executeCliCommand, printer, telemetryService } =
          await initializeDependencies(args);

        return executeCliCommand(async () => {
          await handlePublishCliCommand({
            printer,
            source: args.source ?? process.cwd(),
            telemetry: telemetryService,
            esm: args.esm,
            namespace: args.namespace,
          });
        });
      },
    )
    .command(
      "unpublish",
      "unpublish previously published codemod from Codemod Registry",
      (y) =>
        y.option("force", {
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
          handleUnpublishCliCommand({
            printer,
            name: lastArgument,
            force: args.force ?? false,
          }),
        );
      },
    )
    .command(
      "init",
      "initialize a codemod package",
      (y) =>
        y
          .option("target", {
            alias: "t",
            type: "string",
            description: "Path to init codemod in",
            default: process.cwd(),
          })
          .option("engine", {
            type: "string",
            description: "Engine to initialize codemod with",
          }),
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() =>
          handleInitCliCommand({
            printer,
            target: args.target ?? process.cwd(),
            engine: args.engine,
            esm: args.esm,
          }),
        );
      },
    )
    .command(
      "feedback",
      "submit feedback to the Codemod team",
      (y) => y,
      async (args) => {
        const { executeCliCommand, printer } =
          await initializeDependencies(args);

        return executeCliCommand(() => handleFeedbackCommand({ printer }));
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
