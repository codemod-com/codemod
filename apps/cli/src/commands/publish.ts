import * as fs from "node:fs";
import { basename, dirname, join } from "node:path";
import { CODEMOD_VERSION_EXISTS, isApiError } from "@codemod-com/api-types";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  type CodemodConfig,
  buildCodemodSlug,
  codemodNameRegex,
  doubleQuotify,
  execPromise,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { glob } from "glob";
import inquirer from "inquirer";
import * as semver from "semver";
import { url, safeParse, string } from "valibot";
import { getCodemod, publish } from "../apis.js";
import { getCurrentUserOrLogin, rebuildCodemodFallback } from "../utils.js";
import { handleInitCliCommand } from "./init.js";

export const handlePublishCliCommand = async (options: {
  printer: PrinterBlueprint;
  source: string;
}) => {
  const { printer } = options;
  let { source } = options;

  const { token, allowedNamespaces, organizations } =
    await getCurrentUserOrLogin({
      message: "Authentication is required to publish codemods. Proceed?",
      printer,
    });

  let isSingleFile = false;
  let codemodRcBuf: Buffer;

  const codemodRcPath = join(source, ".codemodrc.json");
  try {
    codemodRcBuf = await fs.promises.readFile(codemodRcPath);
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
      isSingleFile = true;
      mainFilePath = basename(source);
      source = dirname(source);
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

    const { choice } = await inquirer.prompt<{ choice: string }>({
      name: "choice",
      type: "list",
      message:
        "Would you like to adjust the README description file before publishing?",
      choices: [
        "Yes, I want to refine the README.md file and configuration before publishing",
        "No, I want to publish without a description and configuration adjustments",
      ],
      default: 0,
    });

    if (choice.startsWith("Yes")) {
      // Good hint by Copilot, we can actually later open a buffer for user on the fly so that he does not leave the process if that's desired
      // const editor = process.env.EDITOR ?? "vim";
      // await execPromise(`${editor} ${join(resultPath, "README.md")}`);

      // Currently though, we just abort
      printer.printConsoleMessage(
        "info",
        chalk.cyan(
          "\nSelected to adjust the README.md file and configuration before publishing. Aborting...",
        ),
      );
      return;
    }

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

  const formData = new FormData();

  const updateCodemodRC = async (newRc: CodemodConfig) => {
    try {
      await fs.promises.writeFile(
        codemodRcPath,
        JSON.stringify(newRc, null, 2),
      );
    } catch (err) {
      //
    }

    formData.delete(".codemodrc.json");

    formData.append(
      ".codemodrc.json",
      new Blob([Buffer.from(JSON.stringify(newRc))]),
    );
  };

  // for single file codemods we dont want to upload boilerplate README
  if (!isSingleFile) {
    try {
      const descriptionMdBuf = await fs.promises.readFile(
        join(source, "README.md"),
      );
      formData.append("description.md", new Blob([descriptionMdBuf]));
    } catch {
      printer.printConsoleMessage(
        "info",
        chalk.cyan(
          "Could not locate README file at",
          `${chalk.bold(join(source, "README.md"))}.`,
          "Skipping README upload...",
        ),
      );
    }
  }

  formData.append(".codemodrc.json", new Blob([codemodRcBuf]));
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

  let codemodIsPublished = false;
  try {
    await getCodemod(buildCodemodSlug(codemodRc.name), token);
    codemodIsPublished = true;
  } catch (err) {
    //
  }

  if (
    !codemodIsPublished &&
    allowedNamespaces.length > 1 &&
    !codemodRc.name.startsWith("@")
  ) {
    const { namespace } = await inquirer.prompt<{ namespace: string }>({
      type: "list",
      name: "namespace",
      choices: allowedNamespaces,
      default: allowedNamespaces.find(
        (ns) => !organizations.map((org) => org.organization.slug).includes(ns),
      ),
      message:
        "You have access to multiple namespaces. Please choose which one you would like to publish the codemod under.",
    });

    formData.append("namespace", namespace);
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
            nodir: true,
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

    const spinner = printer.withLoaderMessage(
      chalk.cyan("Rebuilding the codemod before publishing..."),
    );

    const mainFilePath = await rebuildCodemodFallback({
      globPattern: codemodRc.build?.output ?? globSearchPattern,
      source,
      errorText: `Could not find the main file of the codemod. ${errorOnMissing}`,
      onSuccess: () => spinner.succeed(),
      onFail: () => spinner.fail(),
    });

    const mainFileBuf = await fs.promises.readFile(mainFilePath);

    formData.append(actualMainFileName, new Blob([mainFileBuf]));
  }

  if (!codemodRc.meta?.git) {
    const { gitUrl } = await inquirer.prompt<{
      gitUrl: string;
    }>({
      type: "input",
      name: "gitUrl",
      suffix: " (leave empty if none)",
      message:
        "Enter the URL of the git repository where this codemod is located.",
      validate: (input) => {
        const stringParsingResult = safeParse(string(), input);
        if (stringParsingResult.success === false) {
          return stringParsingResult.issues[0].message;
        }

        const stringInput = stringParsingResult.output;
        if (stringInput.length === 0) {
          return true;
        }

        const urlParsingResult = safeParse(string([url()]), stringInput);
        if (urlParsingResult.success === false) {
          return urlParsingResult.issues[0].message;
        }

        return true;
      },
    });

    if (gitUrl) {
      try {
        await execPromise("git init", { cwd: source });

        await execPromise(`git remote add origin ${gitUrl}`, {
          cwd: source,
        });

        codemodRc.meta = { tags: [], ...codemodRc.meta, git: gitUrl };

        await updateCodemodRC(codemodRc);
      } catch (err) {
        printer.printConsoleMessage(
          "error",
          `Failed to initialize a git package with provided repository link:\n${
            (err as Error).message
          }. Setting it to null...`,
        );
      }
    }
  }

  if (!codemodRc.meta?.tags || codemodRc.meta.tags.length === 0) {
    const { tags } = await inquirer.prompt<{
      tags: string;
    }>({
      type: "input",
      name: "tags",
      suffix:
        "\nExample: react, javascript, tailwind\nNote: tags help with codemod discoverability and allow us to recommend them where appropriate.\nYou can leave this empty if you don't want to add any tags.\nTags:",
      message:
        "Provide a list of tags for this codemod as a comma-separated string",
    });

    const tagsList =
      tags
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) ?? [];

    if (tagsList.length > 0) {
      codemodRc.meta = { ...codemodRc.meta, tags: tagsList };

      await updateCodemodRC(codemodRc);
    }
  }

  const publishSpinner = printer.withLoaderMessage(
    chalk.cyan(
      "Publishing the codemod using name from",
      chalk.bold(".codemodrc.json"),
      "file:",
      chalk.bold(doubleQuotify(codemodRc.name)),
    ),
  );

  let bumpedVersion = false;
  // Using outer trycatch to catch error from inner catch block too.
  try {
    try {
      await publish(token, formData);
      publishSpinner.succeed();
    } catch (firstError) {
      // Rethrow if no further logic
      if (
        !(firstError instanceof AxiosError) ||
        !firstError.response?.data ||
        !isApiError(firstError.response.data) ||
        firstError.response.data.error !== CODEMOD_VERSION_EXISTS
      ) {
        throw firstError;
      }

      // If error is of specific type (determined above), we first try to upgrade the version
      // and resubmit the request again

      // Kinda hacky, but works for now. Didn't want to change the error format too much.
      const existingVersion = /latest published version: (\d+\.\d+\.\d+)/.exec(
        firstError.response.data.errorText,
      )?.[1];

      if (!existingVersion) {
        throw firstError;
      }

      codemodRc.version = semver.inc(existingVersion, "patch") ?? "0.0.1";

      await updateCodemodRC(codemodRc);

      // In case if this fails, outer catch will be triggered
      await publish(token, formData);
      bumpedVersion = true;
    }
  } catch (error) {
    publishSpinner.fail();
    const message =
      error instanceof AxiosError
        ? error.response?.data.errorText
        : String(error);
    const errorMessage = `${chalk.bold(
      `Could not publish the "${codemodRc.name}" codemod`,
    )}:\n${message}`;
    printer.printOperationMessage({ kind: "error", message: errorMessage });
    return;
  }

  printer.printConsoleMessage(
    "info",
    chalk.bold.cyan(
      `Codemod was successfully published to the registry under the name "${codemodRc.name}".`,
      bumpedVersion
        ? chalk.yellow(
            `\nVersion was automatically bumped to ${chalk.green(codemodRc.version)}.`,
            "Please resort to bumping it manually during your next publish to ensure correct versioning.",
          )
        : "",
    ),
  );

  printer.printConsoleMessage(
    "info",
    `\nNow, you can run the codemod anywhere:\n${chalk.bold(
      `$ codemod ${codemodRc.name}`,
    )}`,
  );

  return codemodRc;
};
