import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

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
} from "@codemod-com/utilities";

import { getCurrentUserData } from "#auth-utils.js";

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
  noPrompt?: boolean;
  noLogs?: boolean;
  writeDirectory?: string | null;
  useDefaultName?: boolean;
}) => {
  const {
    printer,
    noPrompt = false,
    useDefaultName = false,
    writeDirectory = null,
    noLogs = false,
    target,
  } = options;

  if (!fs.existsSync(target)) {
    throw new Error(`Target path ${target} does not exist.`);
  }

  const isTargetAFile = await fs.promises
    .lstat(target)
    .then((pathStat) => pathStat.isFile());

  const userData = await getCurrentUserData();

  const defaultInput = {
    engine: "jscodeshift",
    name: `new-codemod-${randomBytes(4).toString("hex")}`,
    license: "MIT",
    username: userData?.user.username ?? null,
  } as const;

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
      message: `Select a codemod engine ${isTargetAFile ? "your codemod is built with" : "you want to build your codemod with"}:`,
      pageSize: CODEMOD_ENGINE_CHOICES.length,
      choices: CODEMOD_ENGINE_CHOICES,
    },
  ]);

  const downloadInput: ProjectDownloadInput = {
    ...defaultInput,
    ...userAnswers,
  };

  if (isTargetAFile) {
    // Can be read because we handle this error at the start
    downloadInput.codemodBody = await readFile(target, "utf-8");
  }

  const files = getCodemodProjectFiles(downloadInput);

  const codemodBaseDir = join(
    writeDirectory ?? process.cwd(),
    downloadInput.name,
  );

  const created: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    const filePath = join(codemodBaseDir, path);

    try {
      await mkdir(dirname(filePath), { recursive: true });
      if (!fs.existsSync(filePath)) {
        await writeFile(filePath, content);
        created.push(path);
      }
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

  // Install packages
  try {
    await execPromise("pnpm i", { cwd: codemodBaseDir });
  } catch (err) {
    try {
      await execPromise("npm i", { cwd: codemodBaseDir });
    } catch (err) {
      printer.printConsoleMessage(
        "error",
        `Failed to install npm dependencies:\n${(err as Error).message}.`,
      );
    }
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
