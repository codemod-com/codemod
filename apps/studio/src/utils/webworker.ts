/* eslint-disable no-restricted-globals */
import {
	isCallExpression,
	isIdentifier,
	isMemberExpression,
} from '@babel/types';
import jscodeshift, {
	API,
	ArrowFunctionExpression,
	CallExpression,
	Collection,
	FileInfo,
	FunctionDeclaration,
	FunctionExpression,
	JSCodeshift,
} from 'jscodeshift';
import * as tsmorph from 'ts-morph';
import * as ts from 'typescript';
import {
	parseWebWorkerIncomingMessage,
	WebWorkerOutgoingMessage,
} from '../schemata/webWorkersSchemata';
import { EventManager } from './eventManager';
import { isNeitherNullNorUndefined } from './isNeitherNullNorUndefined';
import {
	ProxifiedCollection,
	ProxifiedPath,
	proxifyJSCodeshift,
} from './proxy';

type Exports =
	| {
			__esModule?: true;
			default?: unknown;
			handleSourceFile?: unknown;
	  }
	| Function;

// disable access for particular objects exposed on the global this
// the idea and the code inspired by the articles:
// 1) https://www.meziantou.net/executing-untrusted-javascript-code-in-a-browser.htm
// 2) https://github.com/zhennann/sandbox-webworker/blob/master/src/sandbox.spec.js

/*
@license
MIT License

Copyright (c) 2016-present zhennann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const keys = [
	'fetch',
	'importScripts',
	'addEventListener',
	'removeEventListener',
	'caches',
	'close',
	'fonts',
	'indexedDB',
	'location',
	'navigator',
	'performance',
	'webkitRequestFileSystem',
	'webkitRequestFileSystemSync',
	'webkitResolveLocalFileSystemSyncURL',
	'webkitResolveLocalFileSystemURL',
	'BackgroundFetchManager',
	'BackgroundFetchRecord',
	'BackgroundFetchRegistration',
	'BarcodeDetector',
	'BroadcastChannel',
	'Cache',
	'CacheStorage',
	'DedicatedWorkerGlobalScope',
	'File',
	'FileList',
	'FileReader',
	'FileReaderSync',
	'FileSystemDirectoryHandle',
	'FileSystemFileHandle',
	'FileSystemHandle',
	'FileSystemWritableFileStream',
	'FinalizationRegistry',
	'FontFace',
	'Headers',
	'IDBCursor',
	'IDBCursorWithValue',
	'IDBDatabase',
	'IDBFactory',
	'IDBIndex',
	'IDBKeyRange',
	'IDBObjectStore',
	'IDBOpenDBRequest',
	'IDBRequest',
	'IDBTransaction',
	'IDBVersionChangeEvent',
	'ImageBitmap',
	'ImageBitmapRenderingContext',
	'ImageData',
	'MediaCapabilities',
	'MessageChannel',
	'MessagePort',
	'NavigationPreloadManager',
	'NavigatorUAData',
	'NetworkInformation',
	'Notification',
	'PaymentInstruments',
	'Performance',
	'PeriodicSyncManager',
	'PermissionStatus',
	'Permissions',
	'PushManager',
	'PushSubscription',
	'PushSubscriptionOptions',
	'ReadableByteStreamController',
	'ReadableStream',
	'ReadableStreamBYOBReader',
	'ReadableStreamBYOBRequest',
	'ReadableStreamDefaultController',
	'ReadableStreamDefaultReader',
	'Request',
	'Response',
	'Serial',
	'SerialPort',
	'ServiceWorkerRegistration',
	'StorageManager',
	'SyncManager',
	'USB',
	'USBConfiguration',
	'USBDevice',
	'USBEndpoint',
	'UserActivation',
	'WebAssembly',
	'WebSocket',
	'Worker',
	'WorkerGlobalScope',
	'WorkerLocation',
	'WorkerNavigator',
	'WritableStream',
	'WritableStreamDefaultWriter',
	'XMLHttpRequest',
	'XMLHttpRequestEventTarget',
	'XMLHttpRequestUpload',
];

keys.forEach((key) => {
	const descriptor = Object.getOwnPropertyDescriptor(self, key);

	if (descriptor?.configurable) {
		Object.defineProperty(self, key, {
			get: () => {
				throw new Error(`Cannot access ${key} on the global this`);
			},
			configurable: false,
		});

		return;
	}

	if (typeof self[key as keyof typeof self] === 'function') {
		// defining property for e.g "fetch" disable it

		// @ts-expect-error
		self[key as keyof typeof self] = () => {
			throw new Error(`Cannot access ${key} on the global this`);
		};

		return;
	}

	delete self[key as keyof typeof self];
});

/**
Replaces: `$A.$B($C)`

with: `api.__method($A, $start, $end)($C);`

The idea is that `$A` is likely an expression that ends up with a JSCodeshift collection.

The codemod runner tracks all the produced JSCodeshift collections.
In case of a mismatch, the runner will simply return `$A` from the `__method` call.

`$start` and `$end` indicate the `$B` node position in the original codemod.

This function will work with other JSCodeshift collection functions.
**/
const replaceCallExpression = (
	j: JSCodeshift,
	node: CallExpression,
): CallExpression => {
	if (!isCallExpression(node)) {
		return node;
	}

	const { callee, arguments: args } = node;

	if (!isMemberExpression(callee)) {
		return node;
	}

	const { property, object: obj } = callee;

	const ALLOWED_PROPERTY_NAMES = [
		'every',
		'find',
		'findVariableDeclarators',
		'findJSXElements',
		'filter',
		'forEach',
		'map',
		'paths',
		'remove',
		'replace',
		'replaceWith',
		'some',
		'toSource',
	];

	if (
		!isIdentifier(property) ||
		!ALLOWED_PROPERTY_NAMES.includes(property.name)
	) {
		return node;
	}

	const argumentsParam: CallExpression['arguments'] = [
		obj.type === 'CallExpression' ? replaceCallExpression(j, obj) : obj,
		j.stringLiteral(property.name),
	];

	if (
		isNeitherNullNorUndefined(property.start) &&
		isNeitherNullNorUndefined(property.end)
	) {
		// the end of the selection is marked by the last meaningful's node's end
		// since we can have chaining of nodes, like `root.find(...).remove()`
		// it means that `node.end` can be before the `property.end`
		// if property is e.g. `remove` like in the previous example
		const end = Math.max(
			property.end,
			callee.end ?? property.end,
			node.end ?? property.end,
		);

		argumentsParam.push(j.numericLiteral(property.start));
		argumentsParam.push(j.numericLiteral(end));
	}

	const innerCE = j.callExpression(
		j.memberExpression(j.identifier('api'), j.identifier('__method')),
		argumentsParam,
	);

	return j.callExpression(innerCE, args);
};

export const findTransformFunction = (
	j: JSCodeshift,
	root: Collection<File>,
): Collection<
	FunctionDeclaration | ArrowFunctionExpression | FunctionExpression
> | null => {
	const program = root.find(j.Program).paths()[0] ?? null;

	if (program === null) {
		return null;
	}

	const defaultExport =
		root.find(j.ExportDefaultDeclaration).paths()[0] ?? null;

	const defaultExportDeclaration = defaultExport?.value.declaration ?? null;

	let transformFunction:
		| FunctionDeclaration
		| ArrowFunctionExpression
		| FunctionExpression
		| null = null;

	if (j.FunctionDeclaration.check(defaultExportDeclaration)) {
		transformFunction = defaultExportDeclaration;
	}

	if (j.Identifier.check(defaultExportDeclaration)) {
		program.value.body.forEach((node) => {
			if (
				j.FunctionDeclaration.check(node) &&
				node.id?.name === defaultExportDeclaration.name
			) {
				transformFunction = node;
			}

			if (
				j.VariableDeclaration.check(node) &&
				j.VariableDeclarator.check(node.declarations[0]) &&
				j.Identifier.check(node.declarations[0].id) &&
				node.declarations[0].id.name ===
					defaultExportDeclaration.name &&
				(j.ArrowFunctionExpression.check(node.declarations[0].init) ||
					j.FunctionExpression.check(node.declarations[0].init))
			) {
				transformFunction = node.declarations[0].init;
			}
		});
	}

	return transformFunction ? j(transformFunction) : null;
};

function rewriteCodemod(input: string): string {
	const j = jscodeshift.withParser('tsx');
	const root = j(input);

	const transformFunction = findTransformFunction(j, root);

	// replace expressions like `j(file.source)` with `j(file.source, undefined, start, end)`

	transformFunction
		?.find(j.CallExpression, ({ callee }) => {
			// e.g. `j(*)`
			if (callee.type === 'Identifier') {
				return callee.name === 'j' || callee.name === 'jscodeshift';
			}

			// e.g. `*.jscodeshift(*)`
			if (callee.type === 'MemberExpression') {
				return (
					callee.property.type === 'Identifier' &&
					(callee.property.name === 'j' ||
						callee.property.name === 'jscodeshift')
				);
			}

			return false;
		})
		.replaceWith(({ node }) => {
			if (!isCallExpression(node)) {
				return node;
			}

			const argumentsParam: CallExpression['arguments'] = [
				...node.arguments,
			];

			if (argumentsParam.length === 1) {
				argumentsParam.push(j.identifier('undefined'));
			}

			if (
				isNeitherNullNorUndefined(node.start) &&
				isNeitherNullNorUndefined(node.end)
			) {
				argumentsParam.push(j.numericLiteral(node.start));
				argumentsParam.push(j.numericLiteral(node.end));
			}

			return j.callExpression(node.callee, argumentsParam);
		});

	transformFunction
		?.find(j.CallExpression, {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				property: {
					type: 'Identifier',
				},
			},
		})
		.replaceWith(({ node }) => replaceCallExpression(j, node));

	root.find(j.CallExpression, {
		type: 'CallExpression',
		callee: {
			type: 'MemberExpression',
			object: {
				type: 'Identifier',
				name: 'console',
			},
			property: {
				type: 'Identifier',
			},
		},
	}).replaceWith(({ node }) => {
		if (!isCallExpression(node)) {
			return node;
		}

		const argumentsParam: CallExpression['arguments'] = [...node.arguments];

		if (
			isNeitherNullNorUndefined(node.start) &&
			isNeitherNullNorUndefined(node.end)
		) {
			argumentsParam.push(j.numericLiteral(node.start));
			argumentsParam.push(j.numericLiteral(node.end));
		}

		return {
			...node,
			callee: {
				type: 'Identifier',
				name: 'printMessage',
			},
			arguments: argumentsParam,
		};
	});

	return root.toSource();
}

export const getTransformFunction = async (
	eventManager: EventManager,
	input: string,
): Promise<Function> => {
	const rewrittenInput = rewriteCodemod(input);

	const compiledCode = ts.transpileModule(rewrittenInput, {
		compilerOptions: { module: ts.ModuleKind.CommonJS },
	});

	const exports: Exports = {};
	const module = { exports };

	const requireFunction = (name: string) => {
		if (name === 'ts-morph') {
			return tsmorph;
		}
	};

	const printMessage = (...args: any[]) => {
		const message = args
			.slice(0, -2)
			.map((a) => {
				try {
					return typeof a === 'object'
						? JSON.stringify(a)
						: String(a);
				} catch (error) {
					console.error(error);
					return '';
				}
			})
			.join(', ');

		const start =
			typeof args[args.length - 2] === 'number'
				? args[args.length - 2]
				: NaN;
		const end =
			typeof args[args.length - 1] === 'number'
				? args[args.length - 1]
				: NaN;

		eventManager.pushEvent({
			kind: 'printedMessage',
			codemodSourceRange: {
				start,
				end,
			},
			message,
			timestamp: Date.now(),
			mode: 'control',
		});
	};

	const keys = ['module', 'exports', 'require', 'printMessage'];
	const values = [module, exports, requireFunction, printMessage];

	// eslint-disable-next-line prefer-spread
	new Function(...keys, compiledCode.outputText).apply(null, values);

	const transformer =
		typeof exports === 'function'
			? exports
			: exports.__esModule && typeof exports.default === 'function'
			  ? exports.default
			  : exports.__esModule &&
			      typeof exports.handleSourceFile === 'function'
			    ? exports.handleSourceFile
			    : null;

	if (transformer === null) {
		throw new Error('Could not compile the provided codemod');
	}

	return transformer;
};

interface ProxifiedAPI extends API {
	__method: (
		obj: unknown,
		methodName: string,
		start: number,
		end: number,
	) => unknown;
}

const executeTransformFunction = (
	eventManager: EventManager,
	transform: Function,
	input: string,
) => {
	const proxifiedCollections = new Set<ProxifiedCollection<any>>();
	const proxifiedPaths = new Set<ProxifiedPath<any>>();

	const j = proxifyJSCodeshift(
		jscodeshift.withParser('tsx'),
		eventManager,
		(proxifiedCollection) => {
			proxifiedCollections.add(proxifiedCollection);
		},
		(proxifiedPath) => {
			proxifiedPaths.add(proxifiedPath);
		},
	);

	const buildApi = (): ProxifiedAPI => ({
		j,
		jscodeshift: j,
		stats: () => {
			console.error(
				'The stats function was called, which is not supported on purpose',
			);
		},
		report: () => {
			console.error(
				'The report function was called, which is not supported on purpose',
			);
		},
		__method: (obj, methodName, start, end) => {
			if (proxifiedCollections.has(obj as any)) {
				return Reflect.get(
					obj as ProxifiedCollection<any>,
					`${methodName}_${start}_${end}`,
				).bind(obj);
			}

			if (proxifiedPaths.has(obj as any)) {
				return Reflect.get(
					obj as ProxifiedPath<any>,
					`${methodName}_${start}_${end}`,
				).bind(obj);
			}

			return Reflect.get(obj as any, methodName).bind(obj);
		},
	});

	const api = buildApi();

	const fileInfo: FileInfo = {
		path: 'index.ts',
		source: input,
	};

	const output = transform.apply(undefined, [fileInfo, api, {}]);

	if (typeof output === 'string' || output === undefined || output === null) {
		const events = eventManager.getEvents();

		return { output: output as string | null | undefined, events };
	}

	throw new Error(`Unrecognized output type: ${typeof output};`);
};

self.onmessage = async (messageEvent) => {
	const { engine, content, input } = parseWebWorkerIncomingMessage(
		messageEvent.data,
	);

	const eventManager = new EventManager();

	try {
		if (engine === 'jscodeshift') {
			const transformFunction = await getTransformFunction(
				eventManager,
				content,
			);
			const { output, events } = executeTransformFunction(
				eventManager,
				transformFunction,
				input,
			);

			self.postMessage({
				output,
				events,
			} satisfies WebWorkerOutgoingMessage);
		}

		if (engine === 'tsmorph') {
			const transformFunction = await getTransformFunction(
				eventManager,
				content,
			);

			const project = new tsmorph.Project({
				useInMemoryFileSystem: true,
			});
			const sourceFile = project.createSourceFile('index.tsx', input);
			const output = transformFunction(sourceFile);

			if (typeof output === 'string') {
				self.postMessage({
					output,
					events: [],
				} satisfies WebWorkerOutgoingMessage);
			}
		}
	} catch (error) {
		if (!(error instanceof Error)) {
			console.error(error);
			return;
		}

		self.postMessage({
			output: '',
			events: [
				{
					hashDigest: crypto.randomUUID(),
					kind: 'codemodExecutionError',
					codemodSourceRange: {
						start: 0,
						end: 0,
					},
					message: error.message,
					timestamp: Date.now(),
					mode: 'control',
				},
			],
		} satisfies WebWorkerOutgoingMessage);
	}
};
