import * as path from 'node:path';
import { type NapiConfig, type SgNode, ts as astGrepTsx } from '@ast-grep/napi';
import * as glob from 'glob';
import type { PLazy } from './PLazy.js';
import { astGrep } from './astGrep/astGrep.js';
import { getImports } from './astGrep/getImports.js';
import { fileContext, getCwdContext, getFileContext } from './contexts.js';
import { FunctionExecutor, fnWrapper } from './engineHelpers.js';
import { parseMultistring } from './helpers.js';

/**
 * @description Filter all js/ts files in current directory
 */
export function jsFilesLogic(): PLazy<Helpers> & Helpers;
/**
 * @description Filter file by glob pattern
 * @param globs string or array of globs to search for a files, could be comma/space separated string
 * @example
 * ```ts
 *   await jsFiles('src/app.ts,src/**∕*.tsx').astGrep`import React from 'react'`;
 * ```
 */
export function jsFilesLogic(
	globs: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function jsFilesLogic(
	globs: string | readonly string[],
	callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFilesLogic(
	callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFilesLogic(
	rawGlobs?:
		| string
		| readonly string[]
		| ((helpers: Helpers) => void | Promise<void>),
	maybeCallback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
	return new FunctionExecutor('jsFiles')
		.arguments(() => {
			let globs = parseMultistring(
				!rawGlobs || typeof rawGlobs === 'function'
					? '**/*.{js,jsx,ts,tsx,cjs,mjs}'
					: rawGlobs,
				/[\n; ]/,
			);

			let callback =
				typeof rawGlobs === 'function' ? rawGlobs : maybeCallback;
			return { globs, callback };
		})
		.helpers(helpers)
		.executor(async (next, self) => {
			let { globs, callback } = self.getArguments();
			let { cwd } = getCwdContext();
			let files = await glob.glob(globs, {
				cwd,
				nodir: true,
				ignore: [
					'**/node_modules/**',
					'**/.git/**',
					'**/dist/**',
					'**/build/**',
				],
			});

			for (let file of files) {
				await fileContext.run(
					{ file: path.join(cwd, file), importsUpdates: [] },
					async () => {
						if (callback) {
							await callback(helpers);
						}

						await next();

						let { importsUpdates } = getFileContext();
						let getImportInfo = (node: SgNode) => ({
							from: node.getMatch('FROM')?.text(),
							imports: node
								.getMultipleMatches('IMPORTS')
								.filter((n) => n.kind() !== ',')
								.map((n) => n.text()),
						});
						let importRule: NapiConfig = {
							rule: {
								any: [
									{
										pattern:
											"import { $$$IMPORTS } from '$FROM'",
									},
									{
										pattern:
											'import { $$$IMPORTS } from "$FROM"',
									},
								],
							},
						};
						if (importsUpdates.length) {
							for (let { type, import: line } of importsUpdates) {
								let namedImportsToChange = astGrepTsx
									.parse(line)
									.root()
									.findAll(importRule);
								for (let node of namedImportsToChange) {
									let importChange = getImportInfo(node);
									await astGrep(importRule).replace(
										({ getNode }) => {
											let currentImports =
												getImportInfo(getNode());
											let modified = false;
											if (
												currentImports.from ===
												importChange.from
											) {
												for (let namedImport of importChange.imports) {
													if (type === 'add') {
														if (
															!currentImports.imports.includes(
																namedImport,
															)
														) {
															modified = true;
															currentImports.imports.push(
																namedImport,
															);
														}
													} else if (
														type === 'remove'
													) {
														if (
															currentImports.imports.includes(
																namedImport,
															)
														) {
															modified = true;
															currentImports.imports =
																currentImports.imports.filter(
																	(imp) =>
																		imp !==
																		namedImport,
																);
														}
													}
												}
											}
											if (modified) {
												return `import { ${currentImports.imports.join(
													', ',
												)} } from "${currentImports.from}"`;
											}
											return undefined;
										},
									);
								}
							}
						}
					},
				);
			}
		})
		.run() as any;
}

export let jsFiles = fnWrapper('jsFiles', jsFilesLogic);

let helpers = {
	astGrep,
	getImports,
	addImport: (line: string) => {
		getFileContext().importsUpdates.push({ type: 'add', import: line });
	},
	removeImport: (line: string) => {
		getFileContext().importsUpdates.push({ type: 'remove', import: line });
	},
};

type Helpers = typeof helpers;
