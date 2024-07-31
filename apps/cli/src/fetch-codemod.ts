import { createHash, randomBytes } from "node:crypto";
import { lstat, mkdir, writeFile } from "node:fs/promises";
import { join, parse as pathParse, resolve } from "node:path";
import type { AxiosError } from "axios";
import inquirer from "inquirer";
import semver from "semver";
import { flatten } from "valibot";

import { type Printer, chalk } from "@codemod-com/printer";
import { bundleJS } from "@codemod-com/runner";
import {
  type Codemod,
  type CodemodValidationInput,
  doubleQuotify,
  getCodemodRc,
  isJavaScriptName,
  isRecipeCodemod,
  parseCodemod,
  parseEngineOptions,
  safeParseCodemod,
  safeParseKnownEnginesCodemod,
  safeParseRecipeCodemod,
  untar,
  unzip,
} from "@codemod-com/utilities";
import { getCodemodDownloadURI } from "#api.js";
import { getCurrentUserData } from "#auth-utils.js";
import { handleInitCliCommand } from "#commands/init.js";
import type { GlobalArgvOptions, RunArgvOptions } from "#flags.js";
import { buildSafeArgumentRecord } from "#safe-arguments.js";
import { codemodDirectoryPath, oraCheckmark } from "#utils/constants.js";
import { downloadFile } from "#utils/download.js";

export const populateCodemodArgs = async (options: {
  codemod: Codemod;
  printer: Printer;
  argv: GlobalArgvOptions & RunArgvOptions;
}): Promise<Codemod> => {
  const { codemod, printer, argv } = options;

  const safeArgumentRecord = await buildSafeArgumentRecord(
    codemod,
    argv,
    printer,
  );

  const engineOptions = parseEngineOptions({
    ...argv,
    engine: codemod.config.engine,
  });

  if (isRecipeCodemod(codemod)) {
    return {
      ...codemod,
      codemods: await Promise.all(
        codemod.codemods.map(async (subCodemod) => {
          const codemod = populateCodemodArgs({
            ...options,
            codemod: subCodemod,
          });

          const parsedCodemod = safeParseKnownEnginesCodemod(codemod);

          if (!parsedCodemod.success) {
            if (safeParseRecipeCodemod(codemod).success) {
              throw new Error("Nested recipe codemods are not supported.");
            }

            throw new Error("Nested codemod is of incorrect structure.");
          }

          return parsedCodemod.output;
        }),
      ),
      safeArgumentRecord,
      engineOptions,
    };
  }

  return {
    ...codemod,
    safeArgumentRecord,
    engineOptions,
  };
};

export const fetchCodemod = async (options: {
  nameOrPath: string;
  argv: GlobalArgvOptions & RunArgvOptions;
  printer: Printer;
  disableLogs?: boolean;
}): Promise<Codemod> => {
  const { nameOrPath, printer, disableLogs = false, argv } = options;

  if (!nameOrPath) {
    throw new Error("Codemod to run was not specified!");
  }

  const sourceStat = await lstat(nameOrPath).catch(() => null);

  // Local codemod
  if (sourceStat !== null) {
    const isDirectorySource = sourceStat.isDirectory();

    if (!isDirectorySource) {
      // Codemod in .zip archive
      const { name, ext } = pathParse(nameOrPath);
      if (ext === ".zip") {
        const unzipPath = join(
          codemodDirectoryPath,
          "temp",
          createHash("ripemd160").update(name).digest("base64url"),
        );
        await unzip(nameOrPath, unzipPath);

        return fetchCodemod({
          ...options,
          nameOrPath: unzipPath,
        });
      }

      // Standalone codemod
      // For standalone codemods, before creating a compatible package, we attempt to
      // build the binary because it might have other dependencies in the folder
      const tempFolderPath = join(codemodDirectoryPath, "temp");
      await mkdir(tempFolderPath, { recursive: true });

      let codemodPath = nameOrPath;
      if (isJavaScriptName(nameOrPath)) {
        codemodPath = join(
          tempFolderPath,
          `${randomBytes(8).toString("hex")}.cjs`,
        );

        try {
          const executable = await bundleJS({ entry: nameOrPath });
          await writeFile(codemodPath, executable);
        } catch (err) {
          throw new Error(
            `Error bundling codemod: ${(err as Error).message ?? "Unknown error"}`,
          );
        }
      }

      const codemodPackagePath = await handleInitCliCommand({
        printer,
        source: codemodPath,
        target: tempFolderPath,
        useDefaultName: true,
        noLogs: true,
      });

      const { config } = await getCodemodRc({
        source: codemodPackagePath,
        throwOnNotFound: true,
      });

      if (config.engine === "recipe") {
        return parseCodemod({
          type: "standalone",
          source: "local",
          path: codemodPackagePath,
          config,
        } satisfies CodemodValidationInput);
      }

      return parseCodemod({
        type: "standalone",
        source: "local",
        path: codemodPackagePath,
        config,
      } satisfies CodemodValidationInput);
    }

    // Codemod package
    const { config } = await getCodemodRc({
      source: nameOrPath,
      throwOnNotFound: true,
    });

    const {
      output: codemod,
      success: isValidCodemod,
      issues,
    } = safeParseCodemod({
      type: "package",
      source: "local",
      path: resolve(nameOrPath),
      config,
    });

    if (!isValidCodemod) {
      throw new Error(`Codemod is of incorrect structure: ${flatten(issues)}`);
    }

    if (isRecipeCodemod(codemod)) {
      const codemods = await Promise.all(
        codemod.config.names.map(async (subCodemodName) =>
          fetchCodemod({ ...options, nameOrPath: subCodemodName }),
        ),
      );

      return parseCodemod({ ...codemod, codemods });
    }

    return parseCodemod(codemod satisfies Codemod);
  }

  // make the codemod directory
  const hashDigest = createHash("ripemd160")
    .update(nameOrPath)
    .digest("base64url");

  const path = join(codemodDirectoryPath, hashDigest);
  await mkdir(path, { recursive: true });

  const printableName = chalk.cyan.bold(doubleQuotify(nameOrPath));

  let spinner: ReturnType<typeof printer.withLoaderMessage> | null = null;
  if (!disableLogs) {
    spinner = printer.withLoaderMessage(
      chalk.cyan("Fetching", `${printableName}...`),
    );
  }

  // download codemod
  const userData = await getCurrentUserData();

  const linkResponse = await getCodemodDownloadURI(
    nameOrPath,
    userData?.token,
  ).catch((err) => {
    spinner?.fail();
    throw err;
  });

  const downloadPath = join(path, "codemod.tar.gz");
  const { cacheUsed } = await downloadFile({
    url: linkResponse.link,
    path: downloadPath,
    cache: argv.cache,
  }).catch((err) => {
    spinner?.fail();
    throw new Error(
      (err as AxiosError<{ error: string }>).response?.data?.error ??
        (err as Error).message,
    );
  });

  // If cache was used, the codemod is already unpacked
  if (!cacheUsed) {
    try {
      await untar(downloadPath, path);
    } catch (err) {
      spinner?.fail();
      throw new Error((err as Error).message ?? "Error unpacking codemod");
    }
  }

  spinner?.stopAndPersist({
    symbol: oraCheckmark,
    text: chalk.cyan(
      cacheUsed
        ? `Successfully fetched ${printableName} from local cache.`
        : `Successfully downloaded ${printableName} from the registry.`,
    ),
  });

  const { config } = await getCodemodRc({
    source: path,
    throwOnNotFound: true,
  });

  if (cacheUsed && semver.gt(linkResponse.version, config.version)) {
    if (!disableLogs) {
      printer.printConsoleMessage(
        "info",
        chalk.yellow(
          "Newer version of",
          chalk.cyan(printableName),
          "codemod is available.",
          "Temporarily disabling cache to download the latest version...",
        ),
      );
    }

    return fetchCodemod({
      ...options,
      argv: { ...argv, cache: false },
      disableLogs: true,
    });
  }

  if (config.engine === "recipe") {
    const { names } = await inquirer.prompt<{ names: string[] }>({
      name: "names",
      type: "checkbox",
      message:
        "Select the codemods you would like to run. Codemods will be executed in order.",
      choices: config.names,
      default: config.names,
    });

    config.names = names;

    const subCodemodsSpinner = printer.withLoaderMessage(
      chalk.cyan(`Fetching ${names.length} recipe codemods...`),
    );

    const codemods = await Promise.all(
      config.names.map(async (name) => {
        const subCodemod = await fetchCodemod({
          ...options,
          disableLogs: true,
          nameOrPath: name,
        });

        const populatedCodemod = await populateCodemodArgs({
          codemod: subCodemod,
          printer,
          argv,
        });

        const validatedCodemod = safeParseKnownEnginesCodemod(populatedCodemod);

        if (!validatedCodemod.success) {
          subCodemodsSpinner.fail();
          if (safeParseRecipeCodemod(populatedCodemod).success) {
            throw new Error("Nested recipe codemods are not supported.");
          }

          throw new Error("Nested codemod is of incorrect structure.");
        }

        return validatedCodemod.output;
      }),
    );

    subCodemodsSpinner.stopAndPersist({
      symbol: oraCheckmark,
      text: chalk.cyan("Successfully fetched recipe codemods."),
    });

    return parseCodemod({
      type: "package",
      source: "remote",
      config,
      path,
      codemods,
    } satisfies CodemodValidationInput);
  }

  return parseCodemod({
    type: "package",
    source: "remote",
    config,
    path,
  } satisfies CodemodValidationInput);
};
