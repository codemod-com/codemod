import type { OperationMessage } from "@codemod-com/printer";
import {
	type FormattedFileCommand,
	type RunSettings,
	buildNewDataPathForCreateFileCommand,
	buildNewDataPathForUpdateFileCommand,
} from "@codemod-com/runner";

export const buildPrinterMessageUponCommand = (
	runSettings: RunSettings,
	command: FormattedFileCommand,
): OperationMessage | null => {
	if (!runSettings.dryRun) {
		return null;
	}

	if (command.kind === "createFile") {
		const newDataPath = buildNewDataPathForCreateFileCommand(
			runSettings.outputDirectoryPath,
			command,
		);

		return {
			kind: "create",
			newFilePath: command.newPath,
			newContentPath: newDataPath,
		};
	}

	if (command.kind === "deleteFile") {
		return {
			kind: "delete",
			oldFilePath: command.oldPath,
		};
	}

	if (command.kind === "moveFile") {
		return {
			kind: "move",
			oldFilePath: command.oldPath,
			newFilePath: command.newPath,
		};
	}

	if (command.kind === "updateFile") {
		const newDataPath = buildNewDataPathForUpdateFileCommand(
			runSettings.outputDirectoryPath,
			command,
		);

		return {
			kind: "rewrite",
			oldPath: command.oldPath,
			newDataPath,
		};
	}

	if (command.kind === "copyFile") {
		return {
			kind: "copy",
			oldFilePath: command.oldPath,
			newFilePath: command.newPath,
		};
	}

	throw new Error("Not supported command");
};
