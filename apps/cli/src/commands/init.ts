import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  type KnownEngines,
  type ProjectDownloadInput,
  doubleQuotify,
  execPromise,
  getCodemodProjectFiles,
} from "@codemod-com/utilities";
import inquirer from "inquirer";
import terminalLink from "terminal-link";
import { getCurrentUserData } from "../utils.js";

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

  // TODO:
  // const tags = await getTagsList();
  // const TAGS_CHOICES = tags.map((tag) => ({
  // 	name: tag.name,
  // 	value: tag.aliases.at(0),
  // }));

  let answers: {
    name: string;
    engine: KnownEngines;
    license: License;
    typescript: boolean;
    gitUrl: string;
    npm: boolean;
    path?: string;
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
        name: "gitUrl",
        suffix: " (leave empty if none)",
        message:
          "Is there a git repository URL you want to associate with this codemod?",
      },
      {
        type: "input",
        name: "path",
        message: "Confirm path where you want to initiate a package",
        default: target,
      },
      // TODO:
      // {
      // 	type: "list",
      // 	name: "tags",
      // 	message: "Optionally select tags for your codemod:",
      // 	pageSize: TAGS_CHOICES.length,
      // 	choices: TAGS_CHOICES,
      // },
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
      // TODO:
      // {
      // 	type: "list",
      // 	name: "tags",
      // 	message: "Optionally select tags for your codemod:",
      // 	pageSize: TAGS_CHOICES.length,
      // 	choices: TAGS_CHOICES,
      // },
      {
        type: "confirm",
        when: (answers) =>
          answers.engine !== "ast-grep" && answers.engine !== "recipe",
        name: "typescript",
        message: "Do you want to use TypeScript?",
        default: true,
      },
      {
        type: "input",
        name: "gitUrl",
        message:
          "Is there a git repository URL you want to associate with this codemod?",
      },
      {
        type: "confirm",
        when: (answers) =>
          answers.engine !== "ast-grep" && answers.engine !== "recipe",
        name: "npm",
        message: "Do you want to install npm dependencies?",
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
        // TODO:
        // tags
      }
    : {
        engine: "jscodeshift",
        name: "my-awesome-codemod",
        license: "MIT",
        username: userData?.user.username ?? null,
        // TODO:
        // tags
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

  if (answers?.gitUrl) {
    try {
      await execPromise("git init", { cwd: codemodBaseDir });
    } catch (err) {
      //
    }

    try {
      await execPromise(`git remote add origin ${answers.gitUrl}`, {
        cwd: codemodBaseDir,
      });
    } catch (err) {
      printer.printConsoleMessage(
        "error",
        `Failed to initialize a git package with provided repository link:\n${
          (err as Error).message
        }.`,
      );
    }
  }

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

  const isJsCodemod =
    answers?.engine === "jscodeshift" ||
    answers?.engine === "ts-morph" ||
    answers?.engine === "filemod" ||
    answers === null;
  if (isJsCodemod) {
    printer.printConsoleMessage(
      "info",
      chalk.cyan(
        "\nRun",
        chalk.bold(doubleQuotify("codemod build")),
        "to build the codemod.",
      ),
    );
  }

  const howToRunText = `Run ${chalk.bold(
    doubleQuotify(`codemod --source ${codemodBaseDir}`),
  )} to run the codemod on current working directory (or specify a target using ${chalk.yellow(
    "--target",
  )} option).`;
  printer.printConsoleMessage("info", chalk.cyan(howToRunText));

  let publishText = `Run ${chalk.bold(
    doubleQuotify("codemod publish"),
  )} to publish the codemod to the Codemod registry.`;
  if (isJsCodemod) {
    publishText += chalk.yellow(
      " NOTE: Your codemod has to be built using the build command",
    );
  }
  printer.printConsoleMessage("info", chalk.cyan(publishText));

  const otherGuidelinesText = `For other guidelines, please visit our documentation at ${terminalLink(
    chalk.bold("https://docs.codemod.com"),
    "https://docs.codemod.com",
  )} or type ${chalk.bold(doubleQuotify("codemod --help"))}.`;
  printer.printConsoleMessage("info", chalk.cyan(otherGuidelinesText));

  return codemodBaseDir;
};
