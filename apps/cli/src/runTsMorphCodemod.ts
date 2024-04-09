import { extname } from "node:path";
import vm from "node:vm";
import tsmorph from "ts-morph";
import { nullish, parse, string } from "valibot";
import { getAdapterByExtname } from "./adapters/index.js";
import { buildVmConsole } from "./buildVmConsole.js";
import { CONSOLE_OVERRIDE } from "./consoleOverride.js";
import type { FileCommand } from "./fileCommands.js";
import { SafeArgumentRecord } from "./safeArgumentRecord.js";
import { ConsoleKind } from "./schemata/consoleKindSchema.js";

const transform = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	safeArgumentRecord: SafeArgumentRecord,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): string | undefined | null => {
	const codeToExecute = `
		${CONSOLE_OVERRIDE}

		const __module__ = { exports: {} };

		const keys = ['module', 'exports'];
		const values = [__module__, __module__.exports];

		new Function(...keys, __CODEMOD_SOURCE__).apply(null, values);

		const handleSourceFile = typeof __module__.exports === 'function'
			? __module__.exports
			: __module__.exports.__esModule &&
			typeof __module__.exports.default === 'function'
			? __module__.exports.default
			: typeof __module__.exports.handleSourceFile === 'function'
			? __module__.exports.handleSourceFile
			: null;

		const { Project } = require('ts-morph');

		const project = new Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});
	
		const sourceFile = project.createSourceFile(__CODEMODCOM__oldPath, __CODEMODCOM__oldData);

		handleSourceFile(sourceFile, __CODEMODCOM__argumentRecord);
	`;

	const exports = Object.freeze({});

	const context = vm.createContext({
		module: Object.freeze({
			exports,
		}),
		exports,
		__CODEMODCOM__oldPath: oldPath,
		__CODEMODCOM__oldData: oldData,
		__CODEMODCOM__argumentRecord: safeArgumentRecord,
		__CODEMODCOM__console__: buildVmConsole(consoleCallback),
		__CODEMOD_SOURCE__: codemodSource,
		require: (name: string) => {
			if (name === "ts-morph") {
				return tsmorph;
			}
		},
	});

	const value = vm.runInContext(codeToExecute, context, { timeout: 30000 });

	return parse(nullish(string()), value);
};

export const runTsMorphCodemod = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	disablePrettier: boolean,
	safeArgumentRecord: SafeArgumentRecord,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): readonly FileCommand[] => {
	const adapter = getAdapterByExtname(extname(oldPath));

	const transformFn = adapter !== null ? adapter(transform) : transform;

	const newData = transformFn(
		codemodSource,
		oldPath,
		oldData,
		safeArgumentRecord,
		consoleCallback,
	);

	if (typeof newData !== "string" || oldData === newData) {
		return [];
	}

	return [
		{
			kind: "updateFile",
			oldPath,
			oldData,
			newData,
			formatWithPrettier: !disablePrettier,
		},
	];
};
