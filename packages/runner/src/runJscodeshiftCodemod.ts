import { extname } from 'node:path';
import vm from 'node:vm';
import type { ConsoleKind } from '@codemod-com/printer';
import type { ArgumentRecord, EngineOptions } from '@codemod-com/utilities';
import jscodeshift, { type API } from 'jscodeshift';
import { nullish, parse, string } from 'valibot';
import { getAdapterByExtname } from './adapters/index.js';
import { buildVmConsole } from './buildVmConsole.js';
import { CONSOLE_OVERRIDE } from './consoleOverride.js';
import type { FileCommand } from './fileCommands.js';

export let buildApi = (parser: string): API => ({
	j: jscodeshift.withParser(parser),
	jscodeshift: jscodeshift.withParser(parser),
	stats: () => {},
	report: () => {},
});

let transform = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	api: API,
	options: {
		// the options will be of type ArgumentRecord
		// after the removal of the createFile function
		[x: string]: unknown;
		createFile: (newPath: string, newData: string) => void;
	},
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): string | undefined | null => {
	let codeToExecute = `
		${CONSOLE_OVERRIDE}

		const __module__ = { exports: {} };

		const keys = ['module', 'exports'];
		const values = [__module__, __module__.exports];

		new Function(...keys, __CODEMOD_SOURCE__).apply(null, values);

		const transform = typeof __module__.exports === 'function'
			? __module__.exports
			: __module__.exports.__esModule &&
			typeof __module__.exports.default === 'function'
			? __module__.exports.default
			: null;

		transform(__CODEMODCOM__file, __CODEMODCOM__api, __CODEMODCOM__options);
	`;

	// Create a new context for the code execution
	let exports = Object.freeze({});

	let context = vm.createContext({
		module: Object.freeze({
			exports,
		}),
		exports,
		__CODEMODCOM__file: { source: oldData, path: oldPath },
		__CODEMODCOM__api: api,
		__CODEMODCOM__options: options,
		__CODEMODCOM__console__: buildVmConsole(consoleCallback),
		__CODEMOD_SOURCE__: codemodSource,
	});

	let value = vm.runInContext(codeToExecute, context);

	return parse(nullish(string()), value);
};

export let runJscodeshiftCodemod = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	formatWithPrettier: boolean,
	safeArgumentRecord: ArgumentRecord,
	engineOptions: Extract<EngineOptions, { engine: 'jscodeshift' }> | null,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): readonly FileCommand[] => {
	let commands: FileCommand[] = [];

	let adapter = getAdapterByExtname(extname(oldPath));

	let createFile = (newPath: string, newData: string): void => {
		commands.push({
			kind: 'createFile',
			newPath,
			newData,
			formatWithPrettier,
		});
	};

	let api = buildApi(engineOptions?.parser ?? 'tsx');

	let transformFn = adapter !== null ? adapter(transform) : transform;

	let newData = transformFn(
		codemodSource,
		oldPath,
		oldData,
		api,
		{
			...safeArgumentRecord,
			createFile,
		},
		consoleCallback,
	);

	if (typeof newData !== 'string' || oldData === newData) {
		return commands;
	}

	// sometimes codemods produce newData even though they are literally no changes
	// by removing parentheses around return statements, we will likely find the pointless results
	try {
		let oldRoot = api.jscodeshift(oldData);
		let newRoot = api.jscodeshift(newData);

		oldRoot
			.find(api.j.ParenthesizedExpression)
			.replaceWith((path) => path.node.expression);

		newRoot
			.find(api.j.ParenthesizedExpression)
			.replaceWith((path) => path.node.expression);

		if (oldRoot.toSource() === newRoot.toSource()) {
			return commands;
		}
	} catch (error) {
		console.error(error);
	}

	commands.push({
		kind: 'updateFile',
		oldPath,
		oldData: oldData,
		newData,
		formatWithPrettier,
	});

	return commands;
};
