import * as colors from 'colors-cli';
import { flattenDeep, identity, mapValues } from 'lodash';
import { getRepositoriesContext, parentContext } from './contexts';

export let clc = {
	blueBright: (text: string) => colors.blue_bt(text),
	green: (text: string) => colors.green(text),
	red: (text: string) => colors.red(text),
	yellow: (text: string) => colors.yellow(text),
};

export let promiseTimeout = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export let logger = (message: string) => {
	console.info(`${clc.blueBright('RUN ')} ${message}`);

	return {
		success: (output?: string) =>
			console.info(
				`${clc.green('SUCC')} ${message}${
					output
						? `\n  ${output
								.split('\n')
								.map((line) => `\n    ${line}`)
								.join('')
								.trim()}`
						: ''
				}`,
			),
		fail: (error: string) =>
			console.error(`${clc.red('ERR ')} ${message} - ${error}`),
		warn: (warning: string) =>
			console.warn(`${clc.yellow('WARN')} ${message} - ${warning}`),
	};
};

export let parseRepositories = (
	repos: string | Readonly<string[]> | ((...args: any[]) => Promise<void>),
) => {
	if (typeof repos === 'string') {
		return repos
			.split(/[\n,; ]/)
			.map((repository) => repository.trim())
			.filter(identity);
	}

	if (typeof repos === 'function') {
		return getRepositoriesContext().repositories;
	}

	return flattenDeep(
		repos.map((repository) =>
			repository.split(/[\n, ;]/).map((repository) => repository.trim()),
		),
	).filter(identity);
};

export let parseMultistring = (
	repos: string | readonly string[],
	split = /[\n,; ]/,
) => {
	if (typeof repos === 'string') {
		return repos
			.split(split)
			.map((repository) => repository.trim())
			.filter(identity);
	}

	return flattenDeep(
		repos.map((repository) =>
			repository.split(/[\n, ;]/).map((repository) => repository.trim()),
		),
	).filter(identity);
};

export type MapChildren<Type extends Record<string, (...args: any[]) => any>> =
	{
		[Property in keyof Type]: ReturnType<Type[Property]>;
	};

export let noContextFn = <T extends (...args: any) => ReturnType<T>>(cb: T) =>
	cb();
export let wrapHelpers = <C, H>(helpers: H, context: C): H =>
	mapValues(
		// @ts-ignore
		helpers,
		(value: any) =>
			(...args: any[]) =>
				// @ts-ignore
				parentContext.run(context, () => value(...args)),
	) as any;
