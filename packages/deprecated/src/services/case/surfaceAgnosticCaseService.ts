import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { CaseWritingService, type FileSystem } from "@codemod-com/utilities";
import { JOB_KIND, type SurfaceAgnosticJob } from "@codemod-com/utilities";
import type { ArgumentRecord } from "@codemod-com/utilities";
import {
  type FormattedFileCommand,
  buildNewDataPathForCreateFileCommand,
  buildNewDataPathForUpdateFileCommand,
} from "../../../runner/src/fileCommands.js";
import type { FlowSettings } from "../../../runner/src/schemata/flowSettingsSchema.js";
import type { RunSettings } from "../schemata/runArgvSettingsSchema.js";

export const buildSurfaceAgnosticJob = (
  outputDirectoryPath: string,
  command: FormattedFileCommand,
): SurfaceAgnosticJob => {
  const jobHashDigest = randomBytes(20).toString("base64url");

  if (command.kind === "createFile") {
    const dataUri = buildNewDataPathForCreateFileCommand(
      outputDirectoryPath,
      command,
    );

    return {
      kind: JOB_KIND.CREATE_FILE,
      jobHashDigest,
      pathUri: command.newPath,
      dataUri,
    };
  }

  if (command.kind === "copyFile") {
    return {
      kind: JOB_KIND.COPY_FILE,
      jobHashDigest,
      sourcePathUri: command.oldPath,
      targetPathUri: command.newPath,
    };
  }

  if (command.kind === "deleteFile") {
    return {
      kind: JOB_KIND.DELETE_FILE,
      jobHashDigest,
      pathUri: command.oldPath,
    };
  }

  if (command.kind === "moveFile") {
    return {
      kind: JOB_KIND.MOVE_FILE,
      jobHashDigest,
      oldPathUri: command.oldPath,
      newPathUri: command.newPath,
    };
  }

  if (command.kind === "updateFile") {
    const newDataUri = buildNewDataPathForUpdateFileCommand(
      outputDirectoryPath,
      command,
    );

    return {
      kind: JOB_KIND.UPDATE_FILE,
      jobHashDigest,
      pathUri: command.oldPath,
      newDataUri,
    };
  }

  throw new Error("Unsupported command kind");
};

export class SurfaceAgnosticCaseService {
  protected _caseWritingService: CaseWritingService | null = null;

  public constructor(
    private readonly _fs: FileSystem,
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
