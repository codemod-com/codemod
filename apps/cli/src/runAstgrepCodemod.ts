import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { FileCommand } from "./fileCommands.js";
import type { SafeArgumentRecord } from "./safeArgumentRecord.js";
import { ConsoleKind } from "./schemata/consoleKindSchema.js";

const execPromise = promisify(exec);

type AstGrepCompactOutput = {
	text: string;
	range: {
		byteOffset: { start: number; end: number };
		start: { line: number; column: number };
		end: { line: number; column: number };
	};
	file: string;
	lines: string;
	replacement?: string;
	replacementOffsets?: { start: number; end: number };
	language: string;
	ruleId: string;
	severity: string;
	note: string | null;
	message: string;
};

export const runAstGrepCodemod = async (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	disablePrettier: boolean,
	safeArgumentRecord: SafeArgumentRecord,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): Promise<readonly FileCommand[]> => {
	try {
		// Use `which` command to check if the command is available
		await execPromise("which sg");
	} catch (error) {
		const astInstallCommand = "npm install -g @ast-grep/cli";
		if (process.platform === "win32") {
			await execPromise(`powershell -Command ${astInstallCommand}`);
		} else {
			await execPromise(astInstallCommand);
		}
	}

	const commands: FileCommand[] = [];

	const astCommandBase = `sg scan --inline-rules '\n${codemodSource}\n' ${oldPath} --json=compact`;
	const astCommand =
		process.platform === "win32"
			? `powershell -Command "${astCommandBase}"`
			: astCommandBase;

	const { stdout } = await execPromise(astCommand);
	const matches = JSON.parse(stdout.trim()) as AstGrepCompactOutput[];
	// Sort in reverse order to not mess up replacement offsets
	matches.sort((a, b) => b.range.byteOffset.start - a.range.byteOffset.start);

	let newContent = oldData;
	for (const result of matches) {
		const { replacementOffsets, replacement } = result;
		if (!replacementOffsets) {
			continue;
		}

		newContent =
			newContent.slice(0, replacementOffsets.start) +
			replacement +
			newContent.slice(replacementOffsets.end);
	}

	console.log(newContent);

	// console.dir(output, { depth: 10 });

	// if (output.replacement) {
	// 	if (!output.range.start || !output.range.end) {
	// 		throw new Error("Range not found in ast-grep output");
	// 	}

	// 	// commands.push({
	// 	// 	kind: "updateFile",
	// 	// 	oldPath,
	// 	// 	oldData,
	// 	// 	newData:
	// 	// 		oldData.slice(0, output.range.start) +
	// 	// 		output.replacement +
	// 	// 		oldData.slice(output.range.end),
	// 	// 	formatWithPrettier: !disablePrettier,
	// 	// });
	// 	console.log(
	// 		oldData.slice(0, output.range.start) +
	// 			output.replacement +
	// 			oldData.slice(output.range.end),
	// 	);
	// }

	// if (typeof newData !== "string" || oldData === newData) {
	// 	return commands;
	// }

	// commands.push({
	// 	kind: "updateFile",
	// 	oldPath,
	// 	oldData: oldData,
	// 	newData: oldData,
	// 	formatWithPrettier: !disablePrettier,
	// });

	return commands;
};
