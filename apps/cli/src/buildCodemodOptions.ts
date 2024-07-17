import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  join,
  parse as pathParse,
  resolve,
} from "node:path";
import { CODEMOD_NOT_FOUND } from "@codemod-com/api-types";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import type { Codemod, CodemodSettings } from "@codemod-com/runner";
import {
  type AllEngines,
  type CodemodConfig,
  type FileSystem,
  type TarService,
  allEnginesSchema,
  doubleQuotify,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import unzipper from "unzipper";
import { object, parse } from "valibot";
import type { CodemodDownloaderBlueprint } from "./downloadCodemod.js";
import { rebuildCodemodFallback } from "./utils.js";

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
  printer: PrinterBlueprint,
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

  return rebuildCodemodFallback({
    globPattern: codemodRc.build?.output ?? globSearchPattern,
    source,
    errorText: `Could not find the main file of the codemod with name ${actualMainFileName}. ${errorOnMissing}`,
  });
};

export const buildSourcedCodemodOptions = async (
  fs: FileSystem,
  printer: PrinterBlueprint,
  codemodOptions: CodemodSettings & { kind: "runSourced" },
  codemodDownloader: CodemodDownloaderBlueprint,
  tarService: TarService,
): Promise<Codemod> => {
  const sourceStat = await fs.promises.lstat(codemodOptions.source);
  const isDirectorySource = sourceStat.isDirectory();

  if (!isDirectorySource) {
    const { name, ext } = pathParse(codemodOptions.source);

    if (ext === ".zip") {
      let resultPath: string | null = null;

      const unpackTarget = join(
        homedir(),
        ".codemod",
        "temp",
        createHash("ripemd160").update(name).digest("base64url"),
      );

      const zip = fs
        .createReadStream(codemodOptions.source)
        .pipe(unzipper.Parse({ forceStream: true }));

      for await (const entry of zip) {
        const writablePath = join(unpackTarget, entry.path);

        if (entry.type === "Directory") {
          await fs.promises.mkdir(writablePath, { recursive: true });
          entry.autodrain(); // Skip processing the content of directory entries
        } else {
          if (basename(entry.path) === ".codemodrc.json") {
            resultPath = dirname(writablePath);
          }
          await fs.promises.mkdir(dirname(writablePath), { recursive: true });
          entry.pipe(fs.createWriteStream(writablePath));
        }
      }

      if (resultPath === null) {
        throw new Error(`Could not find .codemodrc.json in the zip file.`);
      }

      return buildSourcedCodemodOptions(
        fs,
        printer,
        { ...codemodOptions, source: resultPath },
        codemodDownloader,
        tarService,
      );
    }

    if (codemodOptions.engine === null) {
      throw new Error("--engine has to be defined when running local codemod");
    }

    return {
      bundleType: "standalone",
      source: "local",
      engine: codemodOptions.engine,
      indexPath: codemodOptions.source,
    };
  }

  let codemodRcContent: string;
  try {
    codemodRcContent = await readFile(
      join(codemodOptions.source, ".codemodrc.json"),
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
    join(codemodOptions.source, ".codemodrc.json"),
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
      chalk.cyan(`Downloading recipe (${subCodemodsNames.length} codemods)`),
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
            tarService,
          );
        }

        try {
          return await codemodDownloader.download(subCodemodName, true);
        } catch (error) {
          spinner.fail();
          if (error instanceof AxiosError) {
            if (
              error.response?.status === 400 &&
              error.response.data.error === CODEMOD_NOT_FOUND
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
      bundleType: "package",
      source: "local",
      name: codemodConfig.name,
      version: codemodConfig.version,
      engine: "recipe",
      directoryPath: codemodOptions.source,
      arguments: codemodConfig.arguments,
      codemods,
    };
  }

  const mainScriptPath = await extractMainScriptPath(
    printer,
    codemodConfig,
    codemodOptions.source,
  );

  return {
    bundleType: "package",
    source: "local",
    engine,
    name: codemodConfig.name,
    version: codemodConfig.version,
    indexPath: mainScriptPath,
    arguments: codemodConfig.arguments,
    directoryPath: codemodOptions.source,
  };
};
