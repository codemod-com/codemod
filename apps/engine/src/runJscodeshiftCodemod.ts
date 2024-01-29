import vm from 'node:vm';
import * as S from '@effect/schema/Schema';
import jscodeshift, { API, FileInfo } from 'jscodeshift';
import type { FileCommand } from './fileCommands.js';
import type { SafeArgumentRecord } from './safeArgumentRecord.js';
import { buildVmConsole } from './buildVmConsole.js';
import { ConsoleKind } from './schemata/consoleKindSchema.js';
import { CONSOLE_OVERRIDE } from './consoleOverride.js';

export const buildApi = (parser: string): API => ({
	j: jscodeshift.withParser(parser),
	jscodeshift: jscodeshift.withParser(parser),
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	stats: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	report: () => {},
});

const transform = (
	codemodSource: string,
	fileInfo: FileInfo,
	api: API,
	options: {
		// the options will be of type ArgumentRecord
		// after the removal of the createFile function
		[x: string]: unknown;
		createFile: (newPath: string, newData: string) => void;
	},
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): string | undefined | null => {
	const codeToExecute = `
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
	const exports = Object.freeze({});

	const context = vm.createContext({
		module: Object.freeze({
			exports,
		}),
		exports,
		__CODEMODCOM__file: fileInfo,
		__CODEMODCOM__api: api,
		__CODEMODCOM__options: options,
		__CODEMODCOM__console__: buildVmConsole(consoleCallback),
		__CODEMOD_SOURCE__: codemodSource,
	});

	const value = vm.runInContext(codeToExecute, context);

	return S.parseSync(S.union(S.string, S.undefined, S.null))(value);
};

export const runJscodeshiftCodemod = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	formatWithPrettier: boolean,
	safeArgumentRecord: SafeArgumentRecord,
	consoleCallback: (kind: ConsoleKind, message: string) => void,
): readonly FileCommand[] => {
	const commands: FileCommand[] = [];

	const createFile = (newPath: string, newData: string): void => {
		commands.push({
			kind: 'createFile',
			newPath,
			newData,
			formatWithPrettier,
		});
	};

	const api = buildApi('tsx');

	const newData = transform(
		codemodSource,
		{
			path: oldPath,
			source: oldData,
		},
		api,
		{
			...safeArgumentRecord[0],
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
		const oldRoot = api.jscodeshift(oldData);
		const newRoot = api.jscodeshift(newData);

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
