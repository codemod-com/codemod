import { join } from "path";
import { CaseWritingService } from "@codemod-com/utilities";
import { IFs } from "memfs";
import { buildSurfaceAgnosticJob } from "../buildSurfaceAgnosticJob.js";
import { FormattedFileCommand } from "../fileCommands.js";
import { SafeArgumentRecord } from "../safeArgumentRecord.js";
import { FlowSettings } from "../schemata/flowSettingsSchema.js";
import { RunSettings } from "../schemata/runArgvSettingsSchema.js";

export class SurfaceAgnosticCaseService {
	protected _caseWritingService: CaseWritingService | null = null;

	public constructor(
		private readonly _fs: IFs,
		private readonly _runSettings: RunSettings,
		private readonly _flowSettings: FlowSettings,
		private readonly _argumentRecord: SafeArgumentRecord,
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
			join(this._runSettings.outputDirectoryPath, "case.data"),
			"w",
		);

		this._caseWritingService = new CaseWritingService(fileHandle);

		await this._caseWritingService?.writeCase({
			caseHashDigest: this._runSettings.caseHashDigest.toString("base64url"),
			codemodHashDigest: this._codemodHashDigest.toString("base64url"),
			createdAt: BigInt(Date.now()),
			absoluteTargetPath: this._flowSettings.target,
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
			buildSurfaceAgnosticJob(this._runSettings.outputDirectoryPath, command),
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
