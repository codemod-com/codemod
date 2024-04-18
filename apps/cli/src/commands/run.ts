import { existsSync } from "node:fs";
import type { buildRunOptions } from "../buildOptions.js";
import type { PrinterBlueprint } from "../printer.js";

export const handleRunCliCommand = async (
	printer: PrinterBlueprint,
	args: Awaited<ReturnType<ReturnType<typeof buildRunOptions>>["argv"]>,
) => {
	const res = args.noCache;
	const lastArgument = String(args._.at(-1));

	if (existsSync(lastArgument)) {
		args.source = lastArgument;
	}

	// const codemodSettings = parseCodemodSettings(argv);
	// const argvFlags = parseFlowSettings(argv);
	// const runSettings = parseRunSettings(homedir(), argv);

	// const codemodDownloader = new CodemodDownloader(
	// 	printer,
	// 	configurationDirectoryPath,
	// 	argv.noCache,
	// 	fileDownloadService,
	// 	tarService,
	// );

	const runner = new Runner(codemods, fs, printer, telemetryService);

	await runner.run();
};
