import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  type KnownEngines,
  type ProjectDownloadInput,
  backtickify,
  doubleQuotify,
  execPromise,
  getCodemodProjectFiles,
} from "@codemod-com/utilities";
import inquirer from "inquirer";
import terminalLink from "terminal-link";
import { getCurrentUserData } from "../utils.js";
// import { handleBuildCliCommand } from "./build.js";

const CODEMOD_ENGINE_CHOICES: (KnownEngines | "recipe")[] = [
  "jscodeshift",
  "recipe",
  "ts-morph",
  "filemod",
  "ast-grep",
  "workflow",
];

type License = "MIT" | "Apache 2.0";
const LICENSE_CHOICES: License[] = ["MIT", "Apache 2.0"];

export const handleInitCliCommand = async (options: {
  printer: PrinterBlueprint;
  target: string;
  noPrompt?: boolean;
  // assumed to be relative to target
  mainFilePath?: string;
}) => {
  const { printer, noPrompt = false, target, mainFilePath } = options;

  let answers: {
    name: string;
    engine: KnownEngines;
    license: License;
    typescript: boolean;
    gitUrl: string;
    npm: boolean;
    path?: string;
    tags?: string;
  } | null = null;

  // We provide main file path when user attempts to publish a non-compatible codemod package.
  // This is the only way we get inside of this conditional
  if (mainFilePath) {
    const defaultedAnswers = {
      typescript: extname(mainFilePath) === ".ts",
      gitUrl: false,
      npm: false,
    };

    const askedAnswers = await inquirer.prompt<{
      name: string;
      engine: KnownEngines;
      license: License;
      gitUrl: string;
      path: string;
    }>([
      {
        type: "input",
        name: "name",
        message: "Please provide a name for your codemod:",
        validate: (input) => (input === "" ? "Name cannot be empty." : true),
      },
      {
        type: "list",
        name: "engine",
        message: "What engine was used to build your codemod?",
        pageSize: CODEMOD_ENGINE_CHOICES.length,
        choices: CODEMOD_ENGINE_CHOICES,
      },
      {
        type: "list",
        name: "license",
        message:
          "What kind of license do you want to include with your codemod?",
        pageSize: LICENSE_CHOICES.length,
        choices: LICENSE_CHOICES,
      },
      {
        type: "input",
        name: "path",
        message: "Confirm path where you want to initiate a package",
        default: target,
      },
    ]);

    answers = {
      ...defaultedAnswers,
      ...askedAnswers,
    };
  } else if (!noPrompt) {
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Provide a name for your codemod:",
        validate: (input) => (input === "" ? "Name cannot be empty." : true),
      },
      {
        type: "list",
        name: "engine",
        message: "Select a codemod engine you want to build your codemod with:",
        pageSize: CODEMOD_ENGINE_CHOICES.length,
        choices: CODEMOD_ENGINE_CHOICES,
      },
      {
        type: "list",
        name: "license",
        message: "Select a license you want to include with your codemod:",
        pageSize: LICENSE_CHOICES.length,
        choices: LICENSE_CHOICES,
      },
      {
        type: "confirm",
        when: (answers) =>
          answers.engine !== "ast-grep" && answers.engine !== "recipe",
        name: "typescript",
        message: "Do you want to use TypeScript?",
        default: true,
      },
      {
        type: "confirm",
        when: (answers) =>
          answers.engine !== "ast-grep" && answers.engine !== "recipe",
        name: "npm",
        message: "Do you want to install the default npm dependencies?",
        default: false,
      },
    ]);
  }

  const userData = await getCurrentUserData();

  const downloadInput: ProjectDownloadInput = answers
    ? {
        engine: answers.engine,
        name: answers.name,
        license: answers.license,
        username: userData?.user.username ?? null,
        vanillaJs: !answers.typescript,
        gitUrl: answers.gitUrl,
      }
    : {
        engine: "jscodeshift",
        name: "my-awesome-codemod",
        license: "MIT",
        username: userData?.user.username ?? null,
      };

  if (mainFilePath) {
    const path = resolve(target, mainFilePath);
    try {
      downloadInput.codemodBody = await readFile(path, "utf-8");
    } catch (err) {
      printer.printConsoleMessage(
        "error",
        chalk(
          "Failed to read provided main file at",
          `${chalk.bold(path)}.`,
          "Aborting codemod creation...",
        ),
      );

      return;
    }
  }

  const files = getCodemodProjectFiles(downloadInput);

  const codemodBaseDir =
    answers?.path ?? join(process.cwd(), downloadInput.name);

  const created: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    const filePath = join(codemodBaseDir, path);

    try {
      await mkdir(dirname(filePath), { recursive: true });
      if (!existsSync(filePath)) {
        await writeFile(filePath, content);
        created.push(path);
      }
    } catch (err) {
      printer.printConsoleMessage(
        "error",
        chalk(
          "Failed to write file",
          `${chalk.bold(path)}:`,
          `${(err as Error).message}.`,
          "Aborting codemod creation...",
        ),
      );

      for (const createdPath of created) {
        try {
          await unlink(join(codemodBaseDir, createdPath));
        } catch (err) {
          //
        }
      }

      return;
    }
  }

  printer.printConsoleMessage(
    "info",
    chalk.cyan("Codemod package created at", `${chalk.bold(codemodBaseDir)}.`),
  );

  if (answers?.npm) {
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
  }

  if (mainFilePath) {
    return codemodBaseDir;
  }

  // const isJsCodemod =
  //   answers?.engine === "jscodeshift" ||
  //   answers?.engine === "ts-morph" ||
  //   answers?.engine === "filemod" ||
  //   answers === null;
  // if (isJsCodemod) {
  //   await handleBuildCliCommand({
  //     printer,
  //     source: codemodBaseDir,
  //     silent: true,
  //   });
  // }

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
