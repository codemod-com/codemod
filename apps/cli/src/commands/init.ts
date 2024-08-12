import { randomBytes } from "node:crypto";
import {
  constants,
  access,
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import inquirer from "inquirer";
import terminalLink from "terminal-link";

import { type Printer, chalk } from "@codemod-com/printer";
import {
  type KnownEngines,
  type ProjectDownloadInput,
  backtickify,
  doubleQuotify,
  execPromise,
  getCodemodProjectFiles,
  isJavaScriptName,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { getCurrentUserData } from "#auth-utils.js";
import { oraCheckmark } from "#utils/constants.js";
import { detectCodemodEngine } from "#utils/detectCodemodEngine.js";
import { isFile } from "#utils/general.js";

const CODEMOD_ENGINE_CHOICES: (KnownEngines | "recipe")[] = [
  "jscodeshift",
  "recipe",
  "ts-morph",
  "filemod",
  "ast-grep",
  "workflow",
];

export const handleInitCliCommand = async (options: {
  printer: Printer;
  target: string;
  source?: string;
  noLogs?: boolean;
  useDefaultName?: boolean;
}) => {
  const {
    printer,
    target,
    source,
    useDefaultName = false,
    noLogs = false,
  } = options;

  if (source) {
    await access(source).catch(() => {
      throw new Error(`Source path ${source} does not exist.`);
    });
  }

  const userData = await getCurrentUserData();

  const defaultInput = {
    engine: "jscodeshift",
    name: `new-codemod-${randomBytes(4).toString("hex")}`,
    license: "MIT",
    username: userData?.user.username ?? null,
  } as const;

  let engineChoices: string[];
  if (!source) {
    engineChoices = CODEMOD_ENGINE_CHOICES;
  } else if (isJavaScriptName(basename(source))) {
    engineChoices = ["jscodeshift", "ts-morph", "filemod", "workflow"];
  } else if (basename(source) === ".codemodrc.json") {
    engineChoices = ["recipe"];
  } else if (
    basename(source).endsWith(".yaml") ||
    basename(source).endsWith(".yml")
  ) {
    engineChoices = ["ast-grep"];
  } else {
    engineChoices = CODEMOD_ENGINE_CHOICES;
  }

  const isSourceAFile = source ? await isFile(source) : false;

  const inferredCodemodEngine = isSourceAFile
    ? await detectCodemodEngine(source as string)
    : undefined;

  const userAnswers = await inquirer.prompt<{
    name: string;
    engine: KnownEngines;
  }>([
    {
      type: "input",
      name: "name",
      message: "Provide a name for your codemod:",
      validate: (input) => (input === "" ? "Name cannot be empty." : true),
      when: !useDefaultName,
    },
    {
      type: "list",
      name: "engine",
      message: `Select a codemod engine ${isSourceAFile ? "your codemod is built with" : "you want to build your codemod with"}:`,
      pageSize: engineChoices.length,
      choices: engineChoices,
      when: !inferredCodemodEngine,
    },
  ]);

  const downloadInput: ProjectDownloadInput = {
    ...defaultInput,
    ...userAnswers,
    ...(inferredCodemodEngine && { engine: inferredCodemodEngine }),
  };

  if (source && isSourceAFile) {
    if (downloadInput.engine === "recipe") {
      try {
        downloadInput.codemodRcBody = parseCodemodConfig(
          await readFile(source, "utf-8"),
        );
      } catch (err) {
        throw new Error(
          chalk(
            "Failed to parse",
            `${chalk.bold(".codemodrc.json")}:`,
            `${(err as Error).message}.`,
            "Aborting...",
          ),
        );
      }
    }
    // Can be read because we handle this error at the start
    downloadInput.codemodBody = await readFile(source, "utf-8");
  }

  const files = getCodemodProjectFiles(downloadInput);

  const codemodBaseDir = join(target ?? process.cwd(), downloadInput.name);
  await access(codemodBaseDir, constants.F_OK).catch(() =>
    mkdir(codemodBaseDir, { recursive: true }),
  );

  const created: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    const filePath = join(codemodBaseDir, path);

    try {
      await mkdir(dirname(filePath), { recursive: true });
      await access(filePath, constants.F_OK).catch(async () => {
        await writeFile(filePath, content);
        created.push(path);
      });
    } catch (err) {
      for (const createdPath of created) {
        try {
          await unlink(join(codemodBaseDir, createdPath));
        } catch (err) {
          //
        }
      }

      throw new Error(
        chalk(
          "Failed to write file",
          `${chalk.bold(path)}:`,
          `${(err as Error).message}.`,
          "Aborting codemod creation...",
        ),
      );
    }
  }

  if (noLogs) {
    return codemodBaseDir;
  }

  printer.printConsoleMessage(
    "info",
    chalk.cyan("Codemod package created at", `${chalk.bold(codemodBaseDir)}.`),
  );

  const installSpinner = printer.withLoaderMessage(
    chalk.cyan("Installing npm dependencies..."),
  );

  // Install packages
  try {
    await execPromise("pnpm i", { cwd: codemodBaseDir });
  } catch (err) {
    try {
      await execPromise("npm i", { cwd: codemodBaseDir });
    } catch (err) {
      installSpinner.fail();
      printer.printConsoleMessage(
        "error",
        `Failed to install npm dependencies:\n${(err as Error).message}.`,
      );
    }
  }

  if (installSpinner.isSpinning) {
    installSpinner.stopAndPersist({
      symbol: oraCheckmark,
      text: chalk.green("Dependencies installed."),
    });
  }

  const howToRunText = chalk(
    `Run ${chalk.bold(doubleQuotify(`codemod --source ${codemodBaseDir}`))}`,
    "to run the codemod on current working directory",
    `\nYou can specify a different target directory using ${chalk.yellow("--target")} option.`,
    `\nType ${chalk.bold(doubleQuotify("codemod --help"))} for a full list of run options.`,
  );
  printer.printConsoleMessage("info", chalk.cyan(howToRunText));

  const publishText = chalk(
    "\nTo publish the codemod to the Codemod Registry, follow the steps below:",
    "\n- Update the codemod source",
    `\n- Adjust the configuration in ${chalk.bold(backtickify(".codemodrc.json"))}`,
    `by referring to ${terminalLink("our documentation", "https://docs.codemod.com")}`,
    `\n- Run ${chalk.bold(doubleQuotify(`codemod publish --source ${codemodBaseDir}`))}`,
  );
  printer.printConsoleMessage("info", chalk.cyan(publishText));

  return codemodBaseDir;
};
