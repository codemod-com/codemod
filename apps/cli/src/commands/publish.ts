import * as fs from "node:fs";
import { join } from "node:path";

import { AxiosError } from "axios";
import inquirer from "inquirer";
import * as semver from "semver";
import { url, safeParse, string } from "valibot";

import { CODEMOD_VERSION_EXISTS, isApiError } from "@codemod-com/api-types";
import { type Printer, chalk } from "@codemod-com/printer";
import type { TelemetrySender } from "@codemod-com/telemetry";
import {
  type CodemodConfig,
  TarService,
  buildCodemodSlug,
  doubleQuotify,
  execPromise,
  getEntryPath,
  parseCodemodConfig,
} from "@codemod-com/utilities";

import { spawn } from "node:child_process";
import { glob } from "glob";
import { version as cliVersion } from "#/../package.json";
import { getCodemod, publish } from "#api.js";
import { handleInitCliCommand } from "#commands/init.js";
import type { TelemetryEvent } from "#telemetry.js";
import { codemodDirectoryPath, getCurrentUserOrLogin } from "#utils.js";

export const handlePublishCliCommand = async (options: {
  printer: Printer;
  source: string;
  telemetry: TelemetrySender<TelemetryEvent>;
}) => {
  let { source, printer, telemetry } = options;

  const { token, allowedNamespaces, organizations } =
    await getCurrentUserOrLogin({
      message: "Authentication is required to publish codemods. Proceed?",
      printer,
    });

  const tarService = new TarService(fs);
  const formData = new FormData();
  const excludedPaths = [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "**/.DS_Store",
    "**/.gitignore",
  ];

  const isSourceAFile = await fs.promises
    .lstat(source)
    .then((pathStat) => pathStat.isFile());

  if (isSourceAFile) {
    source = await handleInitCliCommand({
      printer,
      target: source,
      writeDirectory: join(codemodDirectoryPath, "temp"),
      noLogs: true,
    });

    const { choice } = await inquirer.prompt<{ choice: string }>({
      name: "choice",
      type: "list",
      message:
        "Would you like to adjust the README description file before publishing?",
      choices: [
        "Yes, refine the README.md file",
        "No, publish without a description",
      ],
      default: "No, publish without a description",
    });

    if (choice.startsWith("Yes")) {
      const editor = process.env.EDITOR || process.env.VISUAL || "nano";

      await new Promise<void>((resolve, reject) => {
        const editorProcess = spawn(editor, [join(source, "README.md")], {
          stdio: "inherit", // Inherit the stdio to allow the editor to interact with the terminal
        });

        editorProcess.on("error", (err) => {
          reject(
            new Error(`Failed to start editor '${editor}': ${err.message}`),
          );
        });

        editorProcess.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Editor process exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });
    } else {
      excludedPaths.push("**/README.md");
    }
  }

  const codemodRcPath = join(source, ".codemodrc.json");

  let codemodRcContents: string;
  try {
    codemodRcContents = await fs.promises.readFile(
      join(source, ".codemodrc.json"),
      { encoding: "utf-8" },
    );
  } catch (err) {
    throw new Error(`Could not locate the .codemodrc.json file at ${source}.`);
  }

  let codemodRc: CodemodConfig;
  try {
    codemodRc = parseCodemodConfig(JSON.parse(codemodRcContents));
  } catch (err) {
    throw new Error(`Failed to parse the .codemodrc.json file at ${source}.`);
  }

  const updateCodemodRC = async (newRc: CodemodConfig) => {
    try {
      await fs.promises.writeFile(
        codemodRcPath,
        JSON.stringify(newRc, null, 2),
      );
    } catch (err) {
      //
    }
  };

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
    const { path: mainFilePath, error: errorText } = await getEntryPath({
      codemodRc,
      source,
    });
    if (mainFilePath === null) {
      throw new Error(errorText);
    }
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

  const codemodFilePaths = await glob("**/*", {
    cwd: source,
    ignore: excludedPaths,
    absolute: true,
    dot: true,
    nodir: true,
  });

  const codemodZip = await tarService.pack(
    await Promise.all(
      codemodFilePaths.map(async (path) => ({
        name: path.replace(new RegExp(`.*${source}/`), ""),
        data: await fs.promises.readFile(path),
      })),
    ),
  );

  formData.append(
    "codemod.tar.gz",
    new Blob([codemodZip], { type: "application/gzip" }),
  );

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

    return printer.printOperationMessage({
      kind: "error",
      message: errorMessage,
    });
  } finally {
    if (source.includes("temp")) {
      await fs.promises.rm(source, { recursive: true, force: true });
    }
  }

  telemetry.sendEvent({
    kind: "codemodPublished",
    codemodName: codemodRc.name,
    version: codemodRc.version,
    cliVersion,
  });

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
