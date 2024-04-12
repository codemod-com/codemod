import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { type CodemodConfig, parseCodemodConfig } from "@codemod-com/utilities";
import { getCodemodDownloadURI } from "./apis.js";
import type { Codemod } from "./codemod.js";
import type { FileDownloadServiceBlueprint } from "./fileDownloadService.js";
import type { PrinterBlueprint } from "./printer.js";
import type { TarService } from "./services/tarService.js";
import { boldText, colorizeText, getCurrentUserData } from "./utils.js";

export type CodemodDownloaderBlueprint = Readonly<{
	download(
		name: string,
		disableLoading?: boolean,
	): Promise<Codemod & { source: "package" }>;
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
		disableLoading?: boolean,
	): Promise<Codemod & { source: "package" }> {
		await mkdir(this.__configurationDirectoryPath, { recursive: true });

		// make the codemod directory
		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const directoryPath = join(this.__configurationDirectoryPath, hashDigest);

		await mkdir(directoryPath, { recursive: true });

		let stopLoading = () => {};
		if (!disableLoading) {
			stopLoading = this.__printer.withLoaderMessage((loader) =>
				colorizeText(
					`${loader.get("vertical-dots")}  Downloading the ${boldText(
						`"${name}"`,
					)} codemod${this._cacheDisabled ? ", not using cache..." : "..."}`,
					"cyan",
				),
			);
		}

		// download codemod
		try {
			const userData = await getCurrentUserData();
			const s3DownloadLink = await getCodemodDownloadURI(name, userData?.token);
			const localCodemodPath = join(directoryPath, "codemod.tar.gz");

			const buffer = await this._fileDownloadService.download(
				s3DownloadLink,
				localCodemodPath,
			);

			await this._tarService.extract(directoryPath, buffer);
			stopLoading();
		} catch (err) {
			stopLoading();
			throw err;
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
