import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as S from '@effect/schema/Schema';
import Axios from 'axios';
import { Codemod } from './codemod.js';
import { FileDownloadServiceBlueprint } from './fileDownloadService.js';
import { PrinterBlueprint } from './printer.js';
import { codemodConfigSchema } from './schemata/codemodConfigSchema.js';
import { TarService } from './services/tarService.js';
import { boldText, colorizeText } from './utils.js';

const CODEMOD_REGISTRY_URL =
	'https://codemod-public.s3.us-west-1.amazonaws.com/codemod-registry';

export type CodemodDownloaderBlueprint = Readonly<{
	syncRegistry: () => Promise<void>;
	download(
		name: string,
		cache: boolean,
	): Promise<Codemod & { source: 'registry' }>;
}>;

export class CodemodDownloader implements CodemodDownloaderBlueprint {
	public constructor(
		private readonly __printer: PrinterBlueprint,
		private readonly __configurationDirectoryPath: string,
		protected readonly _cacheDisabled: boolean,
		protected readonly _fileDownloadService: FileDownloadServiceBlueprint,
		protected readonly _tarService: TarService,
	) {}

	public async syncRegistry() {
		this.__printer.printConsoleMessage(
			'info',
			colorizeText(
				`Syncing the Codemod Registry into ${boldText(
					this.__configurationDirectoryPath,
				)}...\n`,
				'cyan',
			),
		);

		await mkdir(this.__configurationDirectoryPath, { recursive: true });

		const getResponse = await Axios.get(
			`${CODEMOD_REGISTRY_URL}/registry.tar.gz`,
			{
				responseType: 'arraybuffer',
			},
		);

		const buffer = Buffer.from(getResponse.data);

		await this._tarService.extract(
			this.__configurationDirectoryPath,
			buffer,
		);
	}

	public async download(
		name: string,
	): Promise<Codemod & { source: 'registry' }> {
		this.__printer.printConsoleMessage(
			'info',

			colorizeText(
				`Downloading the ${boldText(`"${name}"`)} codemod${
					this._cacheDisabled ? ', not using cache...' : '...'
				}`,
				'cyan',
			),
		);

		await mkdir(this.__configurationDirectoryPath, { recursive: true });

		// make the codemod directory
		const hashDigest = createHash('ripemd160')
			.update(name)
			.digest('base64url');

		const directoryPath = join(
			this.__configurationDirectoryPath,
			hashDigest,
		);

		await mkdir(directoryPath, { recursive: true });

		// download the config
		const configPath = join(directoryPath, 'config.json');

		const buffer = await this._fileDownloadService.download(
			`${CODEMOD_REGISTRY_URL}/${hashDigest}/config.json`,
			configPath,
		);

		const parsedConfig = JSON.parse(buffer.toString('utf8'));

		const config = S.parseSync(codemodConfigSchema)(parsedConfig);

		{
			const descriptionPath = join(directoryPath, 'description.md');

			try {
				await this._fileDownloadService.download(
					`${CODEMOD_REGISTRY_URL}/${hashDigest}/description.md`,
					descriptionPath,
				);
			} catch {
				// do nothing, descriptions might not exist
			}
		}

		if (config.engine === 'piranha') {
			const rulesPath = join(directoryPath, 'rules.toml');

			await this._fileDownloadService.download(
				`${CODEMOD_REGISTRY_URL}/${hashDigest}/rules.toml`,
				rulesPath,
			);

			return {
				source: 'registry',
				name,
				engine: config.engine,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (
			config.engine === 'jscodeshift' ||
			config.engine === 'repomod-engine' ||
			config.engine === 'filemod' ||
			config.engine === 'ts-morph'
		) {
			const indexPath = join(directoryPath, 'index.cjs');

			const data = await this._fileDownloadService.download(
				`${CODEMOD_REGISTRY_URL}/${hashDigest}/index.cjs`,
				indexPath,
			);

			await writeFile(indexPath, data);

			return {
				source: 'registry',
				name,
				engine: config.engine,
				indexPath,
				directoryPath,
				arguments: config.arguments,
			};
		}

		if (config.engine === 'recipe') {
			const codemods: Codemod[] = [];

			for (const name of config.names) {
				const codemod = await this.download(name);
				codemods.push(codemod);
			}

			return {
				source: 'registry',
				name,
				engine: config.engine,
				codemods,
				directoryPath,
				arguments: config.arguments,
			};
		}

		throw new Error('Unsupported engine');
	}
}
