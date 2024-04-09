import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CodemodConfig, parseCodemodConfig } from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { getCodemodDownloadURI } from "./apis.js";
import { Codemod } from "./codemod.js";
import { FileDownloadServiceBlueprint } from "./fileDownloadService.js";
import { PrinterBlueprint } from "./printer.js";
import { TarService } from "./services/tarService.js";
import { boldText, colorizeText, getTokenData } from "./utils.js";

export type CodemodDownloaderBlueprint = Readonly<{
	download(name: string): Promise<Codemod & { source: "package" }>;
}>;

export class CodemodDownloader implements CodemodDownloaderBlueprint {
	public constructor(
		private readonly __printer: PrinterBlueprint,
		private readonly __configurationDirectoryPath: string,
		protected readonly _cacheDisabled: boolean,
		protected readonly _fileDownloadService: FileDownloadServiceBlueprint,
		protected readonly _tarService: TarService,
	) {}

	public async download(
		name: string,
	): Promise<Codemod & { source: "package" }> {
		await mkdir(this.__configurationDirectoryPath, { recursive: true });

		// make the codemod directory
		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const directoryPath = join(this.__configurationDirectoryPath, hashDigest);

		await mkdir(directoryPath, { recursive: true });

		const stopLoading = this.__printer.withLoaderMessage((loader) =>
			colorizeText(
				`${loader.get("vertical-dots")}  Downloading the ${boldText(
					`"${name}"`,
				)} codemod${this._cacheDisabled ? ", not using cache..." : "..."}`,
				"cyan",
			),
		);

		// download codemod
		try {
			const tokenData = await getTokenData();
			const s3DownloadLink = await getCodemodDownloadURI(
				name,
				tokenData?.value,
			);
			const localCodemodPath = join(directoryPath, "codemod.tar.gz");

			const buffer = await this._fileDownloadService.download(
				s3DownloadLink,
				localCodemodPath,
			);

			await this._tarService.extract(directoryPath, buffer);
			stopLoading();
		} catch (error) {
			stopLoading();
			if (error instanceof AxiosError) {
				if (
					error.response?.status === 400 &&
					error.response.data.error === "Codemod not found"
				) {
					// Until we have distinction between `codemod` and `codemod run`, we don't want to throw and error here,
					// because it will get picked up by logic in runner.ts, which will prepend `Error while running the codemod`
					// to the error text. We just want to print the error and let user decide what to do for now.
					this.__printer.printConsoleMessage(
						"error",
						// biome-ignore lint: readability reasons
						"The specified command or codemod name could not be recognized.\n" +
							`To view available commands, execute ${boldText(
								`"codemod --help"`,
							)}.\n` +
							`To see a list of existing codemods, run ${boldText(
								`"codemod search"`,
							)} or ${boldText(
								`"codemod list"`,
							)} with a query representing the codemod you are looking for.`,
					);

					process.exit(1);
				}
			}

			throw new Error(`Error while downloading codemod ${name}: ${error}`);
		}

		let config: CodemodConfig;
		try {
			const configBuf = await readFile(join(directoryPath, ".codemodrc.json"));
			config = parseCodemodConfig(JSON.parse(configBuf.toString("utf8")));
		} catch (err) {
			throw new Error(`Error parsing config for codemod ${name}: ${err}`);
		}

		if (config.engine === "ast-grep") {
			try {
				const yamlPath = join(directoryPath, "rule.yaml");

				return {
					source: "package",
					name,
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
				source: "package",
				name,
				engine: config.engine,
				include: config.include,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (
			config.engine === "jscodeshift" ||
			config.engine === "filemod" ||
			config.engine === "ts-morph"
		) {
			const indexPath = join(directoryPath, "index.cjs");

			return {
				source: "package",
				name,
				engine: config.engine,
				include: config.include,
				indexPath,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (config.engine === "recipe") {
			const codemods: Codemod[] = [];

			for (const name of config.names) {
				const codemod = await this.download(name);
				codemods.push(codemod);
			}

			return {
				source: "package",
				name,
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
