import { spawn } from "node:child_process";
import * as fs from "node:fs";
import { join, sep } from "node:path";
import { glob } from "glob";
import inquirer from "inquirer";
import * as semver from "semver";
import * as v from "valibot";

import { type Printer, chalk } from "@codemod-com/printer";
import { BUILT_SOURCE_PATH, getCodemodExecutable } from "@codemod-com/runner";
import type { TelemetrySender } from "@codemod-com/telemetry";
import {
  type CodemodConfig,
  buildCodemodSlug,
  doubleQuotify,
  execPromise,
  getCodemodRc,
  getEntryPath,
  tarInMemory,
} from "@codemod-com/utilities";
import { version as cliVersion } from "#/../package.json";
import { extractPrintableApiError, getCodemod, publish } from "#api.js";
import { getCurrentUserOrLogin } from "#auth-utils.js";
import { handleInitCliCommand } from "#commands/init.js";
import type { TelemetryEvent } from "#telemetry.js";
import { codemodDirectoryPath } from "#utils/constants.js";
import { isFile } from "#utils/general.js";

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

  const tempDirectory = join(codemodDirectoryPath, "temp");
  const formData = new FormData();
  const excludedPaths = [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "**/.DS_Store",
    "**/.gitignore",
  ];

  if (await isFile(source)) {
    source = await handleInitCliCommand({
      printer,
      source,
      target: tempDirectory,
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

  const { config: codemodRc } = await getCodemodRc({
    source,
    throwOnNotFound: true,
  });

  const updateCodemodRC = async (newRc: CodemodConfig) => {
    try {
      await fs.promises.writeFile(
        join(source, ".codemodrc.json"),
        JSON.stringify(newRc, null, 2),
      );
    } catch (err) {
      //
    }
  };

  let bumpedVersion = false;
  const existingCodemod = await getCodemod(
    buildCodemodSlug(codemodRc.name),
    token,
  ).catch(() => null);

  if (existingCodemod !== null) {
    if (
      existingCodemod.versions.find(
        ({ version }) => version === codemodRc.version,
      )
    ) {
      codemodRc.version = semver.inc(codemodRc.version, "patch") ?? "0.0.1";
      await updateCodemodRC(codemodRc);
      bumpedVersion = true;
    }
  } else if (allowedNamespaces.length > 1 && !codemodRc.name.startsWith("@")) {
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
    await getEntryPath({
      source,
      throwOnNotFound: true,
    });
  }

  let gitUrl = codemodRc.meta?.git ?? null;
  if (gitUrl === null) {
    const repoGitUrl = await execPromise("git config --get remote.origin.url", {
      cwd: source,
    }).catch(() => null);

    if (repoGitUrl !== null) {
      const url = repoGitUrl.stdout.trim();

      gitUrl = url.startsWith("git@")
        ? `https://${url.slice(4).replace(":", "/")}`
        : url;
    } else {
      const { gitUrl: userAnsweredGitUrl } = await inquirer.prompt<{
        gitUrl: string;
      }>({
        type: "input",
        name: "gitUrl",
        suffix: " (leave empty if none)",
        message:
          "Enter the URL of the git repository where this codemod is located.",
        validate: (input) => {
          const stringParsingResult = v.safeParse(v.string(), input);
          if (stringParsingResult.success === false) {
            return stringParsingResult.issues[0].message;
          }

          const stringInput = stringParsingResult.output;
          if (stringInput.length === 0) {
            return true;
          }

          const urlParsingResult = v.safeParse(
            v.pipe(v.string(), v.url()),
            stringInput,
          );
          if (urlParsingResult.success === false) {
            return urlParsingResult.issues[0].message;
          }

          return true;
        },
      });

      if (userAnsweredGitUrl?.length > 0) {
        gitUrl = userAnsweredGitUrl;

        try {
          await execPromise("git init", { cwd: source });
          await execPromise(`git remote add origin ${userAnsweredGitUrl}`, {
            cwd: source,
          });
        } catch (err) {}
      }
    }

    // If it was null but we changed it, we need to update the RC file
    if (gitUrl !== null) {
      codemodRc.meta = { tags: [], ...codemodRc.meta, git: gitUrl };
      await updateCodemodRC(codemodRc);
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

  const codemodFileBuffers = await Promise.all(
    codemodFilePaths.map(async (path) => {
      const searchTerm = `${source}${sep}`;

      return {
        name: path
          .slice(path.indexOf(searchTerm) + searchTerm.length)
          .replace(/\\/g, "/"),
        data: await fs.promises.readFile(path),
      };
    }),
  );

  if (codemodRc.engine !== "recipe") {
    const builtExecutable = await getCodemodExecutable(source).catch(
      () => null,
    );

    if (builtExecutable === null) {
      throw new Error(
        chalk(
          "Failed to build the codemod executable.",
          "Please ensure that the node_modules are installed and the codemod is correctly configured.",
        ),
      );
    }

    codemodFileBuffers.push({
      name: BUILT_SOURCE_PATH,
      data: Buffer.from(builtExecutable),
    });
  }

  const archiveBuf = await tarInMemory(codemodFileBuffers);

  if (archiveBuf === null) {
    throw new Error("Failed to read the tar archive of the codemod.");
  }

  formData.append(
    "codemod.tar.gz",
    new Blob([archiveBuf], { type: "application/gzip" }),
  );

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

    const message = extractPrintableApiError(error);
    const errorMessage = `${chalk.bold(
      `Could not publish the "${codemodRc.name}" codemod`,
    )}:\n${message}`;

    return printer.printOperationMessage({
      kind: "error",
      message: errorMessage,
    });
  } finally {
    if (source.includes(tempDirectory)) {
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
