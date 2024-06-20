import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import type { Codemod } from '@codemod-com/runner';
import {
	type CodemodConfig,
	doubleQuotify,
	parseCodemodConfig,
} from '@codemod-com/utilities';
import type { TarService } from '@codemod-com/utilities';
import type { Ora } from 'ora';
import { getCodemodDownloadURI } from './apis.js';
import type { FileDownloadServiceBlueprint } from './fileDownloadService.js';
import { getCurrentUserData } from './utils.js';

export type CodemodDownloaderBlueprint = Readonly<{
	download(
		name: string,
		disableSpinner?: boolean,
	): Promise<Codemod & { source: 'package' }>;
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
		disableSpinner?: boolean,
	): Promise<Codemod & { source: 'package' }> {
		await mkdir(this.__configurationDirectoryPath, { recursive: true });

		// make the codemod directory
		let hashDigest = createHash('ripemd160')
			.update(name)
			.digest('base64url');

		let directoryPath = join(this.__configurationDirectoryPath, hashDigest);

		await mkdir(directoryPath, { recursive: true });

		let spinner: Ora | null = null;
		if (!disableSpinner) {
			spinner = this.__printer.withLoaderMessage(
				chalk.cyan(
					'Downloading the',
					chalk.bold(doubleQuotify(name)),
					'codemod',
					this._cacheDisabled ? '' : '(using cache)',
				),
			);
		}

		// download codemod
		try {
			let userData = await getCurrentUserData();
			let s3DownloadLink = await getCodemodDownloadURI(
				name,
				userData?.token,
			);
			let localCodemodPath = join(directoryPath, 'codemod.tar.gz');

			let buffer = await this._fileDownloadService.download(
				s3DownloadLink,
				localCodemodPath,
			);

			await this._tarService.unpack(directoryPath, buffer);
			spinner?.succeed();
		} catch (err) {
			spinner?.fail();
			throw err;
		}

		let config: CodemodConfig;
		try {
			let configBuf = await readFile(
				join(directoryPath, '.codemodrc.json'),
			);
			config = parseCodemodConfig(JSON.parse(configBuf.toString('utf8')));
		} catch (err) {
			throw new Error(`Error parsing config for codemod ${name}: ${err}`);
		}

		if (config.engine === 'ast-grep') {
			try {
				let yamlPath = join(directoryPath, 'rule.yaml');

				return {
					source: 'package',
					name,
					engine: config.engine,
					include: config.include,
					indexPath: yamlPath,
					directoryPath,
					arguments: config.arguments,
				};
			} catch (error) {
				if (!(error instanceof Error)) {
					throw new Error('Error while downloading ast-grep codemod');
				}

				this.__printer.printOperationMessage({
					kind: 'error',
					message: error.message,
				});
			}
		}

		if (config.engine === 'piranha') {
			let rulesPath = join(directoryPath, 'rules.toml');

			return {
				source: 'package',
				name,
				engine: config.engine,
				include: config.include,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (
			config.engine === 'jscodeshift' ||
			config.engine === 'filemod' ||
			config.engine === 'ts-morph'
		) {
			let indexPath = join(directoryPath, 'index.cjs');

			return {
				source: 'package',
				name,
				engine: config.engine,
				include: config.include,
				indexPath,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (config.engine === 'recipe') {
			let codemods: Codemod[] = [];

			for (let name of config.names) {
				let codemod = await this.download(name);
				codemods.push(codemod);
			}

			return {
				source: 'package',
				name,
				engine: config.engine,
				include: config.include,
				codemods,
				directoryPath,
				arguments: config.arguments,
			};
		}

		throw new Error('Unsupported engine');
	}
}
