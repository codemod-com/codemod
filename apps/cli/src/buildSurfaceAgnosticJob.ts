import { randomBytes } from "node:crypto";
import {
  type FormattedFileCommand,
  buildNewDataPathForCreateFileCommand,
  buildNewDataPathForUpdateFileCommand,
} from "@codemod-com/runner";
import { JOB_KIND, type SurfaceAgnosticJob } from "@codemod-com/utilities";

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
