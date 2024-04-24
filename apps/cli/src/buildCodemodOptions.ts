import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path, { resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import type { Codemod, CodemodSettings } from "@codemod-com/runner";
import {
  type AllEngines,
  type CodemodConfig,
  type FileSystem,
  allEnginesSchema,
  doubleQuotify,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { glob } from "fast-glob";
import { object, parse } from "valibot";
import type { CodemodDownloaderBlueprint } from "./downloadCodemod.js";

const extractEngine = async (
  fs: FileSystem,
  filePath: string,
): Promise<AllEngines | null> => {
  try {
    const data = await fs.promises.readFile(filePath, {
      encoding: "utf-8",
    });

    const schema = object({
      engine: allEnginesSchema,
    });

    const { engine } = parse(schema, JSON.parse(data.toString()));

    return engine;
  } catch {
    return null;
  }
};

const extractMainScriptPath = async (
  codemodRc: CodemodConfig,
  source: string,
) => {
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
      errorOnMissing = `Did you forget to run "codemod build"?`;
  }

  const mainFiles = await glob(codemodRc.build?.output ?? globSearchPattern, {
    absolute: true,
    cwd: source,
    onlyFiles: true,
  });

  if (mainFiles.length === 0) {
    throw new Error(
      `Could not find the main file of the codemod with name ${actualMainFileName}. ${errorOnMissing}`,
    );
  }

  return mainFiles.at(0)!;
};

export const buildSourcedCodemodOptions = async (
  fs: FileSystem,
  printer: PrinterBlueprint,
  codemodOptions: CodemodSettings & { kind: "runSourced" },
  codemodDownloader: CodemodDownloaderBlueprint,
): Promise<Codemod> => {
  const isDirectorySource = await fs.promises
    .lstat(codemodOptions.source)
    .then((pathStat) => pathStat.isDirectory());

  if (!isDirectorySource) {
    if (codemodOptions.codemodEngine === null) {
      throw new Error("--engine has to be defined when running local codemod");
    }

    return {
      source: "standalone",
      engine: codemodOptions.codemodEngine,
      indexPath: codemodOptions.source,
    };
  }

  let codemodRcContent: string;
  try {
    codemodRcContent = await readFile(
      path.join(codemodOptions.source, ".codemodrc.json"),
      { encoding: "utf-8" },
    );
  } catch (err) {
    throw new Error(
      `Codemod directory is of incorrect structure at ${codemodOptions.source}`,
    );
  }

  const codemodConfig = parseCodemodConfig(JSON.parse(codemodRcContent));

  const engine = await extractEngine(
    fs,
    path.join(codemodOptions.source, ".codemodrc.json"),
  );

  if (engine === "piranha" || engine === null) {
    throw new Error(
      `Engine specified in .codemodrc.json at ${codemodOptions.source} is not a valid codemod engine for local run.`,
    );
  }

  if (engine === "recipe") {
    const subCodemodsNames = (
      codemodConfig as CodemodConfig & { engine: "recipe" }
    ).names;

    const spinner = printer.withLoaderMessage(
      chalk.cyan(`Downloading ${subCodemodsNames.length} recipe codemods...`),
    );

    const codemods = await Promise.all(
      subCodemodsNames.map(async (subCodemodName) => {
        const localMachinePath = resolve(codemodOptions.source, subCodemodName);

        if (existsSync(localMachinePath)) {
          return buildSourcedCodemodOptions(
            fs,
            printer,
            { ...codemodOptions, source: resolve(subCodemodName) },
            codemodDownloader,
          );
        }

        try {
          return await codemodDownloader.download(subCodemodName, true);
        } catch (error) {
          spinner.fail();
          if (error instanceof AxiosError) {
            if (
              error.response?.status === 400 &&
              error.response.data.error === "Codemod not found"
            ) {
              throw new Error(
                `Error locating one of the recipe codemods: ${chalk.bold(
                  doubleQuotify(subCodemodName),
                )}`,
              );
            }
          }

          throw error;
        }
      }),
    );

    spinner.succeed();

    return {
      source: "package",
      name: codemodConfig.name,
      engine: "recipe",
      directoryPath: codemodOptions.source,
      arguments: codemodConfig.arguments,
      codemods,
    };
  }

  const mainScriptPath = await extractMainScriptPath(
    codemodConfig,
    codemodOptions.source,
  );

  return {
    source: "package",
    engine,
    name: codemodConfig.name,
    indexPath: mainScriptPath,
    arguments: codemodConfig.arguments,
    directoryPath: codemodOptions.source,
  };
};
