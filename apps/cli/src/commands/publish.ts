import * as fs from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  codemodNameRegex,
  doubleQuotify,
  execPromise,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { glob } from "fast-glob";
import FormData from "form-data";
import inquirer from "inquirer";
import { publish } from "../apis.js";
import { getCurrentUserData } from "../utils.js";
import { handleInitCliCommand } from "./init.js";

export const handlePublishCliCommand = async (
  printer: PrinterBlueprint,
  source: string,
) => {
  const userData = await getCurrentUserData();

  if (userData === null) {
    throw new Error(
      "To be able to publish to Codemod Registry, please log in first.",
    );
  }

  const { token } = userData;

  const formData = new FormData();

  let codemodRcBuf: Buffer;
  try {
    codemodRcBuf = await fs.promises.readFile(join(source, ".codemodrc.json"));
  } catch (err) {
    const { init } = await inquirer.prompt<{
      init: boolean;
    }>({
      type: "confirm",
      name: "init",
      message:
        "Could not find the .codemodrc.json file in the codemod directory. Would you like to initialize the codemod configuration now?",
    });

    if (!init) {
      throw new Error(
        "To publish your codemod, please configure it first by running `codemod init` in the codemod directory.",
      );
    }

    // Attempting to find index file to change the questions slightly
    let mainFilePath: string | undefined;

    const isSourceAFile = await fs.promises
      .lstat(source)
      .then((pathStat) => pathStat.isFile());

    if (isSourceAFile) {
      // biome-ignore lint: If source is a file, we define source as a directory that this file is in
      source = dirname(source);
      mainFilePath = basename(source);
    } else {
      const { mainPath } = await inquirer.prompt<{
        mainPath: string;
      }>({
        type: "input",
        name: "mainPath",
        message:
          "If there is a main codemod file, please provide the relative path leading to it, e.g. `src/index.ts`.",
        default: "empty",
      });

      if (mainPath !== "empty") {
        mainFilePath = mainPath;
      }
    }

    const resultPath = await handleInitCliCommand({
      printer,
      target: source,
      mainFilePath: mainFilePath ?? "index.ts",
    });

    if (!mainFilePath) {
      printer.printConsoleMessage(
        "info",
        "Codemod initialization has been completed, however no main file was provided. Consider adjusting the main file for the codemod to become meaningful first.",
      );
      return;
    }

    if (!resultPath) {
      throw new Error(
        "Unexpected error, codemod package initialization has been canceled.",
      );
    }

    // biome-ignore lint: If user changed the directory where he wants the `codemod init` to put its results, we continue execution as if this was a source
    source = resultPath;

    try {
      codemodRcBuf = await fs.promises.readFile(
        join(resultPath, ".codemodrc.json"),
      );
    } catch (err) {
      throw new Error(
        "Unexpected error, codemodrc file could not be found after codemod package initialization has been completed.",
      );
    }
  }

  formData.append(".codemodrc.json", codemodRcBuf);
  const codemodRcData = codemodRcBuf.toString("utf-8");
  const codemodRc = parseCodemodConfig(JSON.parse(codemodRcData));

  if (codemodRc.engine === "recipe") {
    if (codemodRc.names.length < 2) {
      throw new Error(
        `The "names" field in .codemodrc.json must contain at least two names for a recipe codemod.`,
      );
    }

    for (const name of codemodRc.names) {
      if (!codemodNameRegex.test(name)) {
        throw new Error(
          `Each entry in the "names" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
        );
      }
    }
  }

  if (!codemodNameRegex.test(codemodRc.name)) {
    throw new Error(
      `The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
    );
  }

  if (codemodRc.engine !== "recipe") {
    let globSearchPattern: string;
    let actualMainFileName: string;
    let errorOnMissing: string;

    switch (codemodRc.engine) {
      case "ast-grep":
        globSearchPattern = "**/rule.yaml";
        actualMainFileName = "rule.yaml";
        errorOnMissing = `Please create the main "rule.yaml" file first.`;
        break;
      case "piranha":
        globSearchPattern = "**/rules.toml";
        actualMainFileName = "rules.toml";
        errorOnMissing = `Please create the main "rules.toml" file first.`;
        break;
      default:
        globSearchPattern = "dist/index.cjs";
        actualMainFileName = "index.cjs";
        if (codemodRc.build?.input) {
          const inputFiles = await glob(codemodRc.build.input, {
            absolute: true,
            cwd: source,
            onlyFiles: true,
          });
          const entryPoint = inputFiles.at(0);
          if (entryPoint === undefined) {
            errorOnMissing = `Please create the main file under ${chalk.bold(
              codemodRc.build.input,
            )} first.`;
            break;
          }
        }

        if (codemodRc.build?.output) {
          errorOnMissing = `Please make sure the output path in your .codemodrc.json under ${chalk.bold(
            codemodRc.build.output,
          )} flag is correct.`;
          break;
        }

        errorOnMissing =
          "Please make sure your codemod can be built correctly.";
    }

    const locateMainFile = async () => {
      const mainFiles = await glob(
        codemodRc.build?.output ?? globSearchPattern,
        {
          absolute: true,
          ignore: ["**/node_modules/**"],
          cwd: source,
          onlyFiles: true,
        },
      );

      return mainFiles.at(0);
    };

    let mainFilePath = await locateMainFile();
    if (mainFilePath === undefined) {
      const spinner = printer.withLoaderMessage(
        chalk.cyan(
          "Could not find the main file of the codemod. Trying to build...",
        ),
      );

      try {
        // Try to build the codemod anyways, and if after build there is still no main file
        // or the process throws - throw an error
        await execPromise("codemod build", { cwd: source });

        mainFilePath = await locateMainFile();
        spinner.succeed();
        // Likely meaning that the "codemod build" command succeeded, but the file was still not found in output
        if (mainFilePath === undefined) {
          throw new Error();
        }
      } catch (error) {
        spinner.fail();
        throw new Error(
          `Could not find the main file of the codemod. ${errorOnMissing}`,
        );
      }
    }

    const mainFileBuf = await fs.promises.readFile(mainFilePath);

    formData.append(actualMainFileName, mainFileBuf);
  }

  try {
    const descriptionMdBuf = await fs.promises.readFile(
      join(source, "README.md"),
    );
    formData.append("description.md", descriptionMdBuf);
  } catch {
    //
  }

  const publishSpinner = printer.withLoaderMessage(
    chalk.cyan(
      "Publishing the codemod using name from",
      chalk.bold(".codemodrc.json"),
      "file:",
      chalk.bold(doubleQuotify(codemodRc.name)),
    ),
  );

  try {
    await publish(token, formData);
    publishSpinner.succeed();
  } catch (error) {
    publishSpinner.fail();
    const message =
      error instanceof AxiosError ? error.response?.data.error : String(error);
    const errorMessage = `${chalk.bold(
      `Could not publish the "${codemodRc.name}" codemod`,
    )}:\n${message}`;
    printer.printOperationMessage({ kind: "error", message: errorMessage });
    return;
  }

  printer.printConsoleMessage(
    "info",
    chalk.bold(
      chalk.cyan(
        `Codemod was successfully published to the registry under the name "${codemodRc.name}".`,
      ),
    ),
  );

  printer.printConsoleMessage(
    "info",
    `\nNow, you can run the codemod anywhere:\n${chalk.bold(
      `$ codemod ${codemodRc.name}`,
    )}`,
  );
};
