import { FileSystem, Uri } from 'vscode';
import { DownloadService, ForbiddenRequestError } from './downloadService';
import { MessageBus, MessageKind } from './messageBus';

// aka bootstrap engines
export class BootstrapExecutablesService {
	constructor(
		private readonly __downloadService: DownloadService,
		private readonly __globalStorageUri: Uri,
		private readonly __fileSystem: FileSystem,
		private readonly __messageBus: MessageBus,
	) {
		__messageBus.subscribe(MessageKind.bootstrapEngine, () =>
			this.__onBootstrapEngines(),
		);
	}

	private async __onBootstrapEngines() {
		await this.__fileSystem.createDirectory(this.__globalStorageUri);

		const codemodEngineNodeExecutableUri =
			await this.__bootstrapCodemodEngineNodeExecutableUri();

		const codemodEngineRustExecutableUri =
			await this.__bootstrapCodemodEngineRustExecutableUri();

		this.__messageBus.publish({
			kind: MessageKind.engineBootstrapped,
			codemodEngineNodeExecutableUri,
			codemodEngineRustExecutableUri,
		});
	}

	private async __bootstrapCodemodEngineNodeExecutableUri(): Promise<Uri> {
		const platform =
			process.platform === 'darwin'
				? 'macos'
				: process.platform === 'win32'
				  ? 'win'
				  : encodeURIComponent(process.platform);

		// TODO rename to `codemod` on S3
		// the codemod files should work with the codemod home directory

		const executableBaseName = `intuita-${platform}`;
		const executableExt = process.platform === 'win32' ? '.exe' : '';
		const executableName = `${executableBaseName}${executableExt}`;

		const executableUri = Uri.joinPath(
			this.__globalStorageUri,
			executableName,
		);

		try {
			// TODO codemod-public
			await this.__downloadService.downloadFileIfNeeded(
				`https://intuita-public.s3.us-west-1.amazonaws.com/intuita/${executableName}`,
				executableUri,
				'755',
			);
		} catch (error) {
			if (!(error instanceof ForbiddenRequestError)) {
				throw error;
			}

			throw new Error(
				`Your platform (${process.platform}) is not supported.`,
			);
		}

		return executableUri;
	}

	private async __bootstrapCodemodEngineRustExecutableUri(): Promise<Uri | null> {
		const platform =
			process.platform === 'darwin'
				? 'macos'
				: encodeURIComponent(process.platform);

		if (platform === 'win32') {
			return null;
		}

		const executableBaseName = `codemod-engine-rust-${platform}`;

		const executableUri = Uri.joinPath(
			this.__globalStorageUri,
			executableBaseName,
		);

		try {
			// TODO codemod-public
			await this.__downloadService.downloadFileIfNeeded(
				`https://intuita-public.s3.us-west-1.amazonaws.com/codemod-engine-rust/${executableBaseName}`,
				executableUri,
				'755',
			);
		} catch (error) {
			if (!(error instanceof ForbiddenRequestError)) {
				throw error;
			}

			throw new Error(
				`Your platform (${process.platform}) is not supported.`,
			);
		}

		return executableUri;
	}
}
