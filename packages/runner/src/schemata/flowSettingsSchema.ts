import { resolve } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import {
	type Output,
	array,
	boolean,
	minValue,
	number,
	object,
	optional,
	parse,
	string,
} from 'valibot';

export let DEFAULT_EXCLUDE_PATTERNS = [
	'*.d.ts',
	'node_modules/',
	'.next/',
	'dist/',
	'build/',
];
export let DEFAULT_VERSION_CONTROL_DIRECTORIES = [
	'.git/',
	'.svn/',
	'.hg/',
	'.bzr/',
	'_darcs/',
	'_MTN/',
	'_FOSSIL_',
	'.fslckout',
	'.view/',
];
export let DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export let DEFAULT_ENABLE_PRETTIER = true;
export let DEFAULT_CACHE = true;
export let DEFAULT_INSTALL = true;
export let DEFAULT_USE_JSON = false;
export let DEFAULT_THREAD_COUNT = 4;
export let DEFAULT_DRY_RUN = false;
export let DEFAULT_TELEMETRY = true;

export let flowSettingsSchema = object({
	_: array(string()),
	include: optional(array(string())),
	exclude: optional(array(string()), []),
	target: optional(string()),
	files: optional(array(string())),
	format: optional(boolean(), DEFAULT_ENABLE_PRETTIER),
	cache: optional(boolean(), DEFAULT_CACHE),
	install: optional(boolean(), DEFAULT_INSTALL),
	json: optional(boolean(), DEFAULT_USE_JSON),
	threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<Output<typeof flowSettingsSchema>, 'target'> & {
	target: string;
};

export let parseFlowSettings = (
	input: unknown,
	printer: PrinterBlueprint,
): FlowSettings => {
	let flowSettings = parse(flowSettingsSchema, input);

	let positionalPassedTarget = flowSettings._.at(1);
	let argTarget = flowSettings.target;

	let target: string;
	if (positionalPassedTarget && argTarget) {
		printer.printConsoleMessage(
			'info',
			chalk.yellow(
				'Both positional and argument target options are passed. Defaulting to the argument target option...',
			),
		);

		target = argTarget;
	} else {
		target =
			positionalPassedTarget ?? argTarget ?? DEFAULT_INPUT_DIRECTORY_PATH;
	}

	return {
		...flowSettings,
		target: resolve(target),
	};
};
