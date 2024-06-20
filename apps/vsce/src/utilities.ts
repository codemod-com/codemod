import { createHash } from 'node:crypto';
import { sep } from 'node:path';
import * as t from 'io-ts';
import { Project } from 'ts-morph';
import { Uri, type Webview } from 'vscode';
import type { _ExplorerNode } from './persistedState/explorerNodeCodec';

export function isNeitherNullNorUndefined<T>(value: T): value is T & {} {
	return value !== null && value !== undefined;
}

export function assertsNeitherNullOrUndefined<T>(
	value: T,
): asserts value is T & {} {
	if (value === null || value === undefined) {
		throw new Error('The value cannot be null or undefined');
	}
}

export let buildHash = (data: string) =>
	createHash('ripemd160').update(data).digest('base64url');

export let buildTypeCodec = <T extends t.Props>(
	props: T,
): t.ReadonlyC<t.ExactC<t.TypeC<T>>> => t.readonly(t.exact(t.type(props)));

export let debounce = <R,>(callback: (...args: any[]) => R, ms: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: any[]) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => callback(...args), ms);
	};
};

export let timeout = (ms: number) =>
	new Promise((_, reject) =>
		setTimeout(
			() =>
				reject(new Error('Timeout while looking for a git repository')),
			ms,
		),
	);

export let singleQuotify = (str: string) => `'${str}'`;
export let doubleQuotify = (str: string) => `"${str}"`;

export let buildCrossplatformArg = (str: string) => {
	let isWin = process.platform === 'win32';
	// remove trailing "\"
	return isWin ? doubleQuotify(str.replace(/\\+$/, '')) : singleQuotify(str);
};

export function getUri(
	webview: Webview,
	extensionUri: Uri,
	pathList: string[],
) {
	return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export let capitalize = (str: string): string => {
	if (!str) {
		return '';
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

// taken from https://stackoverflow.com/a/63361543
export let streamToString = async (stream: NodeJS.ReadableStream) => {
	let chunks = [];

	for await (let chunk of stream) {
		if (chunk instanceof Buffer) {
			chunks.push(chunk);
			continue;
		}

		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks).toString('utf-8');
};

export let buildCodemodMetadataHash = (name: string) =>
	createHash('ripemd160')
		.update('README.md')
		.update(name)
		.digest('base64url');

export let findParentExplorerNode = (
	index: number,
	explorerNodes: _ExplorerNode[],
): { node: _ExplorerNode; index: number } | null => {
	let explorerNode = explorerNodes[index] ?? null;
	if (explorerNode === null) {
		return null;
	}

	for (let i = index - 1; i >= 0; i--) {
		let node = explorerNodes[i] ?? null;

		if (node === null) {
			return null;
		}

		if (node.depth < explorerNode.depth) {
			return { node, index: i };
		}
	}
	return null;
};

// remove all special characters and whitespace
export let removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, '').replace(/\s/g, '');

export let removeLineBreaksAtStartAndEnd = (str: string) =>
	str
		.replace(/^\n+/, '') // remove all occurrences of `\n` at the start
		.replace(/\n+$/, ''); // remove all occurrences of `\n` at the end

export let createInMemorySourceFile = (filePath: string, content: string) => {
	let project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	return project.createSourceFile(filePath, content);
};

export let buildGlobPattern = (targetUri: Uri, pattern?: string) => {
	let { fsPath: targetUriFsPath } = targetUri;

	// Glob patterns should always use / as a path separator, even on Windows systems, as \ is used to escape glob characters.
	let pathParts = targetUriFsPath.split(sep);

	pathParts.push(pattern ?? '');

	return pathParts.join('/');
};
