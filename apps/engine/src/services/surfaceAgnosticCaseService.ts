import { join } from 'path';
import { CaseWritingService } from '@codemod-com/utilities';
import type { IFs } from 'memfs';
import { buildSurfaceAgnosticJob } from '../buildSurfaceAgnosticJob.js';
import type { FormattedFileCommand } from '../fileCommands.js';
import type { ArgumentRecord } from '../schemata/argumentRecordSchema.js';
import type { FlowSettings } from '../schemata/flowSettingsSchema.js';
import type { RunSettings } from '../schemata/runArgvSettingsSchema.js';

export class SurfaceAgnosticCaseService {
	protected _caseWritingService: CaseWritingService | null = null;

	public constructor(
		private readonly _fs: IFs,
		private readonly _runSettings: RunSettings,
		private readonly _flowSettings: FlowSettings,
		private readonly _argumentRecord: ArgumentRecord,
		private readonly _codemodHashDigest: Buffer,
	) {}

	public async emitPreamble(): Promise<void> {
		if (!this._runSettings.dryRun || !this._runSettings.streamingEnabled) {
			return;
		}

		await this._fs.promises.mkdir(this._runSettings.outputDirectoryPath, {
			recursive: true,
		});

		const fileHandle = await this._fs.promises.open(
			join(this._runSettings.outputDirectoryPath, 'case.data'),
			'w',
		);

		this._caseWritingService = new CaseWritingService(fileHandle);

		await this._caseWritingService?.writeCase({
			caseHashDigest:
				this._runSettings.caseHashDigest.toString('base64url'),
			codemodHashDigest: this._codemodHashDigest.toString('base64url'),
			createdAt: BigInt(Date.now()),
			absoluteTargetPath: this._flowSettings.targetPath,
			argumentRecord: this._argumentRecord,
		});
	}

	public async emitJob(command: FormattedFileCommand): Promise<void> {
		if (
			!this._runSettings.dryRun ||
			!this._runSettings.streamingEnabled ||
			this._caseWritingService === null
		) {
			return;
		}

		await this._caseWritingService.writeJob(
			buildSurfaceAgnosticJob(
				this._runSettings.outputDirectoryPath,
				command,
			),
		);
	}

	public async emitPostamble(): Promise<void> {
		if (
			!this._runSettings.dryRun ||
			!this._runSettings.streamingEnabled ||
			this._caseWritingService === null
		) {
			return;
		}

		await this._caseWritingService.finish();
	}
}
