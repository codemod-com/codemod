import type { FileSystem } from 'vscode';
import { Uri } from 'vscode';
import type { DownloadService } from './downloadService';
import { ForbiddenRequestError } from './downloadService';
import type { MessageBus } from './messageBus';
import { MessageKind } from './messageBus';

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

		// Uri.file('/intuita/nora-node-engine/package/intuita-linux')
		const codemodEngineNodeExecutableUri =
			await this.__bootstrapCodemodEngineNodeExecutableUri();

		// Uri.file('/intuita/codemod-engine-rust/target/release/codemod-engine-rust');
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
				: encodeURIComponent(process.platform);

		const executableBaseName = `intuita-${platform}`;

		const executableUri = Uri.joinPath(
			this.__globalStorageUri,
			executableBaseName,
		);

		try {
			await this.__downloadService.downloadFileIfNeeded(
				`https://intuita-public.s3.us-west-1.amazonaws.com/intuita/${executableBaseName}`,
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

	private async __bootstrapCodemodEngineRustExecutableUri(): Promise<Uri> {
		const platform =
			process.platform === 'darwin'
				? 'macos'
				: encodeURIComponent(process.platform);

		const executableBaseName = `codemod-engine-rust-${platform}`;

		const executableUri = Uri.joinPath(
			this.__globalStorageUri,
			executableBaseName,
		);

		try {
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
