import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import type { Codemod } from "@codemod-com/runner";
import type { CodemodDownloadLinkResponse } from "@codemod-com/utilities";
import {
  type CodemodConfig,
  doubleQuotify,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import type { TarService } from "@codemod-com/utilities";
import type { AxiosError } from "axios";
import inquirer from "inquirer";
import type { Ora } from "ora";
import semver from "semver";
import { getCodemodDownloadURI } from "./apis.js";
import {
  FileDownloadService,
  type FileDownloadServiceBlueprint,
} from "./fileDownloadService.js";
import { getCurrentUserData, oraCheckmark } from "./utils.js";

export type CodemodDownloaderBlueprint = Readonly<{
  download(
    name: string,
    disableSpinner?: boolean,
  ): Promise<Codemod & { bundleType: "package"; source: "registry" }>;
}>;

export class CodemodDownloader implements CodemodDownloaderBlueprint {
  public constructor(
    private readonly __printer: PrinterBlueprint,
    private readonly __configurationDirectoryPath: string,
    protected readonly _cacheEnabled: boolean,
    protected readonly _fileDownloadService: FileDownloadServiceBlueprint,
    protected readonly _tarService: TarService,
  ) {}

  public async download(
    name: string,
    disableSpinner?: boolean,
  ): Promise<Codemod & { bundleType: "package"; source: "registry" }> {
    await mkdir(this.__configurationDirectoryPath, { recursive: true });

    // make the codemod directory
    const hashDigest = createHash("ripemd160").update(name).digest("base64url");

    const directoryPath = join(this.__configurationDirectoryPath, hashDigest);

    await mkdir(directoryPath, { recursive: true });

    const printableName = chalk.cyan.bold(doubleQuotify(name));

    let spinner: Ora | null = null;
    if (!disableSpinner) {
      spinner = this.__printer.withLoaderMessage(
        chalk.cyan("Fetching", `${printableName}...`),
      );
    }

    // download codemod
    const userData = await getCurrentUserData();

    let linkResponse: CodemodDownloadLinkResponse;
    try {
      linkResponse = await getCodemodDownloadURI(name, userData?.token);
    } catch (err) {
      spinner?.fail();
      throw new Error(
        (err as AxiosError<{ error: string }>).response?.data?.error ??
          "Error getting download link for codemod",
      );
    }
    const localCodemodPath = join(directoryPath, "codemod.tar.gz");

    let downloadResult: Awaited<
      ReturnType<FileDownloadServiceBlueprint["download"]>
    >;

    try {
      downloadResult = await this._fileDownloadService.download(
        linkResponse.link,
        localCodemodPath,
      );
    } catch (err) {
      spinner?.fail();
      throw new Error(
        (err as AxiosError<{ error: string }>).response?.data?.error ??
          "Error downloading codemod from the registry",
      );
    }

    const { data, cacheUsed } = downloadResult;

    try {
      await this._tarService.unpack(directoryPath, data);
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
      const configBuf = await readFile(join(directoryPath, ".codemodrc.json"));
      config = parseCodemodConfig(JSON.parse(configBuf.toString("utf8")));
    } catch (err) {
      throw new Error(`Error parsing config for codemod ${name}: ${err}`);
    }

    if (
      this._fileDownloadService.cacheEnabled &&
      semver.gt(linkResponse.version, config.version)
    ) {
      this.__printer.printConsoleMessage(
        "info",
        chalk.yellow(
          "Newer version of",
          chalk.cyan(name),
          "codemod is available.",
          "Temporarily disabling cache to download the latest version...",
        ),
      );

      return new CodemodDownloader(
        this.__printer,
        this.__configurationDirectoryPath,
        false,
        new FileDownloadService(
          false,
          this._fileDownloadService._ifs,
          this._fileDownloadService._printer,
        ),
        this._tarService,
      ).download(name, disableSpinner);
    }

    if (config.engine === "ast-grep") {
      try {
        const yamlPath = join(directoryPath, "rule.yaml");

        return {
          bundleType: "package",
          source: "registry",
          name,
          version: config.version,
          engine: config.engine,
          include: config.include,
          indexPath: yamlPath,
          directoryPath,
          arguments: config.arguments,
        };
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error("Error while downloading ast-grep codemod");
        }

        this.__printer.printOperationMessage({
          kind: "error",
          message: error.message,
        });
      }
    }

    if (config.engine === "piranha") {
      const rulesPath = join(directoryPath, "rules.toml");

      return {
        bundleType: "package",
        source: "registry",
        name,
        version: config.version,
        engine: config.engine,
        include: config.include,
        directoryPath,
        arguments: config.arguments,
      };
    }

    if (
      config.engine === "jscodeshift" ||
      config.engine === "filemod" ||
      config.engine === "ts-morph" ||
      config.engine === "workflow"
    ) {
      const indexPath = join(directoryPath, "index.cjs");

      return {
        bundleType: "package",
        source: "registry",
        name,
        version: config.version,
        engine: config.engine,
        include: config.include,
        indexPath,
        directoryPath,
        arguments: config.arguments,
      };
    }

    if (config.engine === "recipe") {
      const codemods: Codemod[] = [];

      const { names } = await inquirer.prompt<{ names: string[] }>({
        name: "names",
        type: "checkbox",
        message:
          "Select the codemods you want to run (use space and arrow keys to select, enter to confirm)",
        choices: config.names,
        default: config.names,
      });

      config.names = names;

      for (const name of config.names) {
        const codemod = await this.download(name);
        codemods.push(codemod);
      }

      return {
        bundleType: "package",
        source: "registry",
        name,
        version: config.version,
        engine: config.engine,
        include: config.include,
        codemods,
        directoryPath,
        arguments: config.arguments,
      };
    }

    throw new Error("Unsupported engine");
  }
}
