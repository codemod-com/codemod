import { extname } from 'node:path';
import type { Options } from 'prettier';

let parserMappers = new Map<string, Options['parser']>([
	['ts', 'typescript'],
	['tsx', 'typescript'],
	['js', 'babel'],
	['jsx', 'babel'],
	['json', 'json'],
	['json5', 'json5'],
	['jsonc', 'json'],
	['css', 'css'],
	['scss', 'scss'],
	['less', 'less'],
	['graphql', 'graphql'],
	['md', 'markdown'],
	['mdx', 'mdx'],
	['html', 'html'],
	['vue', 'vue'],
	['yaml', 'yaml'],
	['yml', 'yaml'],
]);

let DEFAULT_PRETTIER_OPTIONS: Options = {
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	trailingComma: 'all',
	bracketSpacing: true,
	arrowParens: 'always',
	endOfLine: 'lf',
	parser: 'typescript',
};

let getConfig = async (path: string): Promise<Options> => {
	let { resolveConfig } = await import('prettier');
	let config = await resolveConfig(path, {
		editorconfig: false,
	});

	if (config === null || Object.keys(config).length === 0) {
		config = DEFAULT_PRETTIER_OPTIONS;
	}

	let parser: Options['parser'] =
		parserMappers.get(extname(path).slice(1)) ?? 'typescript';

	return {
		...config,
		parser,
	};
};

export let formatText = async (
	path: string,
	oldData: string,
	formatWithPrettier: boolean,
): Promise<string> => {
	let newData = oldData.replace(/\/\*\* \*\*\//gm, '');

	if (!formatWithPrettier) {
		return newData;
	}

	try {
		let { format } = await import('prettier');
		let options = await getConfig(path);
		return await format(newData, options);
	} catch (err) {
		return newData;
	}
};

export let singleQuotify = (str: string) => `'${str}'`;
export let doubleQuotify = (str: string) => `"${str}"`;
export let backtickify = (str: string) => `\`${str}\``;

export let buildCrossplatformArg = (str: string) => {
	let isWin = process.platform === 'win32';
	// remove trailing "\"
	return isWin ? doubleQuotify(str.replace(/\\+$/, '')) : singleQuotify(str);
};

export let capitalize = (str: string): string => {
	if (!str) {
		return '';
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

// remove all special characters and whitespace
export let removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, '').replace(/\s/g, '');

export let removeLineBreaksAtStartAndEnd = (str: string) =>
	str
		.replace(/^\n+/, '') // remove all occurrences of `\n` at the start
		.replace(/\n+$/, ''); // remove all occurrences of `\n` at the end
