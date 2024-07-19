import { createHash } from "node:crypto";
import type { Stats } from "node:fs";
import * as fs from "node:fs/promises";
import { mkdir, readFile } from "node:fs/promises";
import { join, parse as pathParse, resolve } from "node:path";

import type { AxiosError } from "axios";
import inquirer from "inquirer";
import semver from "semver";
import { flatten } from "valibot";

import type { CodemodDownloadLinkResponse } from "@codemod-com/api-types";
import { type Printer, chalk } from "@codemod-com/printer";
import {
  type Codemod,
  type CodemodConfig,
  type KnownEnginesCodemodValidationInput,
  type RecipeCodemodValidationInput,
  type TarService,
  doubleQuotify,
  isEngine,
  isRecipeCodemod,
  parseCodemod,
  parseCodemodConfig,
  parseEngineOptions,
  parseKnownEnginesCodemod,
  parseRecipeCodemod,
  safeParseCodemod,
  safeParseKnownEnginesCodemod,
  safeParseRecipeCodemod,
} from "@codemod-com/utilities";

import { getCodemodDownloadURI } from "#apis.js";
import type { GlobalArgvOptions, RunArgvOptions } from "#buildOptions.js";
import type { FileDownloadService } from "#fileDownloadService.js";
import { buildSafeArgumentRecord } from "#safeArgumentRecord.js";
import {
  codemodDirectoryPath,
  getCurrentUserData,
  oraCheckmark,
  unpackZipCodemod,
} from "#utils.js";

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

  // codemodToRun.hashDigest = createHash("ripemd160")
  //   .update(codemod.config.name)
  //   .digest();

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
  fileDownloadService: FileDownloadService;
  tarService: TarService;
  disableLogs?: boolean;
}): Promise<Codemod> => {
  const {
    nameOrPath,
    printer,
    fileDownloadService,
    tarService,
    disableLogs = false,
    argv,
  } = options;
  // const codemodSettings = parse(runSettingsSchema, input);

  if (!nameOrPath) {
    throw new Error("Codemod to run was not specified!");
  }

  let sourceStat: Stats | null = null;
  try {
    sourceStat = await fs.lstat(nameOrPath);
  } catch (err) {
    //
  }

  // Local codemod
  if (sourceStat !== null) {
    const isDirectorySource = sourceStat.isDirectory();

    if (!isDirectorySource) {
      // Codemod in .zip archive
      const { name, ext } = pathParse(nameOrPath);
      if (ext === ".zip") {
        const resultPath = await unpackZipCodemod({
          source: nameOrPath,
          target: join(
            codemodDirectoryPath,
            "temp",
            createHash("ripemd160").update(name).digest("base64url"),
          ),
        });

        if (resultPath === null) {
          throw new Error(`Could not find .codemodrc.json in the zip file.`);
        }

        return fetchCodemod({
          ...options,
          nameOrPath: resultPath,
        });
      }

      // Standalone codemod
      if (!isEngine(argv.engine)) {
        throw new Error(
          "Engine must be specified for standalone codemods. Use --engine flag.",
        );
      }

      const config = parseCodemodConfig({
        name: "Standalone codemod",
        version: "1.0.0",
        engine: argv.engine,
      });

      if (config.engine === "recipe") {
        throw new Error(
          "Recipe engine is not supported for standalone codemods.",
        );
      }

      return parseKnownEnginesCodemod({
        type: "standalone",
        source: "local",
        path: resolve(nameOrPath),
        config,
      } satisfies KnownEnginesCodemodValidationInput);
    }

    // Codemod package
    let codemodConfig: CodemodConfig;
    try {
      const codemodRcContent = await readFile(
        join(nameOrPath, ".codemodrc.json"),
        { encoding: "utf-8" },
      );
      codemodConfig = parseCodemodConfig(JSON.parse(codemodRcContent));
    } catch (err) {
      throw new Error(
        `Codemod directory is of incorrect structure at ${nameOrPath}`,
      );
    }

    const {
      output: codemod,
      success: isValidCodemod,
      issues,
    } = safeParseCodemod({
      type: "package",
      source: "local",
      path: resolve(nameOrPath),
      config: codemodConfig,
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

      return parseRecipeCodemod({ ...codemod, codemods });
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

  let linkResponse: CodemodDownloadLinkResponse;
  try {
    linkResponse = await getCodemodDownloadURI(nameOrPath, userData?.token);
  } catch (err) {
    spinner?.fail();
    throw err;
  }

  let downloadResult: Awaited<ReturnType<FileDownloadService["download"]>>;

  try {
    downloadResult = await fileDownloadService.download({
      url: linkResponse.link,
      path: path,
      cachePingPath: join(path, ".codemodrc.json"),
    });
  } catch (err) {
    spinner?.fail();
    throw new Error(
      (err as AxiosError<{ error: string }>).response?.data?.error ??
        "Error downloading codemod from the registry",
    );
  }

  const { data, cacheUsed } = downloadResult;

  try {
    await tarService.unpack(path, data);
  } catch (err) {
    spinner?.fail();
    throw new Error((err as Error).message ?? "Error unpacking codemod");
  }

  spinner?.stopAndPersist({
    symbol: oraCheckmark,
    text: chalk.cyan(
      cacheUsed
        ? `Successfully fetched ${printableName} from local cache.`
        : `Successfully downloaded ${printableName} from the registry.`,
    ),
  });

  let config: CodemodConfig;
  try {
    const configBuf = await readFile(join(path, ".codemodrc.json"));
    config = parseCodemodConfig(JSON.parse(configBuf.toString("utf8")));
  } catch (err) {
    throw new Error(
      `Error parsing config for codemod ${printableName}: ${err}`,
    );
  }

  if (
    fileDownloadService.cacheEnabled &&
    semver.gt(linkResponse.version, config.version)
  ) {
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
    } satisfies RecipeCodemodValidationInput);
  }

  return parseCodemod({
    type: "package",
    source: "remote",
    config,
    path,
  } satisfies KnownEnginesCodemodValidationInput);
};
