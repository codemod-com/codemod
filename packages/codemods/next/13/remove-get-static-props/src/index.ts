import type { Filemod, HandleData, HandleFile } from '@codemod-com/filemod';
import type {
	ASTNode,
	ArrowFunctionExpression,
	Collection,
	File,
	FunctionDeclaration,
	FunctionExpression,
	JSCodeshift,
	Node,
} from 'jscodeshift';

type Dependencies = Readonly<{
	jscodeshift: JSCodeshift;
}>;

type State = {
	step: RepomodStep;
};

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];

let noop = {
	kind: 'noop',
} as const;

let ADD_BUILD_LEGACY_CTX_UTIL_CONTENT = `
import { type ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const buildLegacyCtx = (headers: ReadonlyHeaders, cookies: ReadonlyRequestCookies, params: Record<string, string | string[] | undefined>, searchParams: Record<string, string | string[]>) => {
	return {
	  query: { ...searchParams, ...params },
	  params, 
	  req: { headers, cookies }
	}
  }
`;

type Settings = Partial<Record<string, string | boolean | Collection<any>>>;

type ModFunction<T, D extends 'read' | 'write'> = (
	j: JSCodeshift,
	root: Collection<T>,
	settings: Settings,
) => [D extends 'write' ? boolean : false, ReadonlyArray<LazyModFunction>];

type LazyModFunction = [
	ModFunction<any, 'read' | 'write'>,
	Collection<any>,
	Settings,
];

let findLastIndex = <T,>(
	array: Array<T>,
	predicate: (value: T, index: number, obj: T[]) => boolean,
): number => {
	let l = array.length;
	while (l--) {
		if (predicate(array[l]!, l, array)) return l;
	}
	return -1;
};

let getFirstIndexAfterImports = (j: JSCodeshift, file: Collection<File>) => {
	let programBody = file.find(j.Program).paths()[0]?.value.body ?? [];

	let lastImportDeclarationIndex = findLastIndex(programBody, (node) =>
		j.ImportDeclaration.check(node),
	);

	return lastImportDeclarationIndex + 1;
};

let getFirstIndexAfterExportNamedFunctionDeclaration = (
	j: JSCodeshift,
	body: unknown[],
	functionName: string,
): number => {
	let lastImportDeclarationIndex = findLastIndex(body, (node) => {
		// function declaration within an export named declaration
		if (
			j.ExportNamedDeclaration.check(node) &&
			j.FunctionDeclaration.check(node.declaration) &&
			j.Identifier.check(node.declaration.id) &&
			node.declaration.id.name === functionName
		) {
			return true;
		}

		// variable declarator within an export named declaration
		if (
			j.ExportNamedDeclaration.check(node) &&
			j.VariableDeclaration.check(node.declaration)
		) {
			let [declaration] = node.declaration.declarations;

			return (
				j.VariableDeclarator.check(declaration) &&
				j.Identifier.check(declaration.id) &&
				declaration.id.name === functionName
			);
		}

		if (
			j.FunctionDeclaration.check(node) &&
			j.Identifier.check(node.id) &&
			node.id.name === functionName
		) {
			return true;
		}

		return false;
	});

	return lastImportDeclarationIndex + 1;
};

/**
 * factories
 */

let generateStaticParamsFunctionFactory = (j: JSCodeshift) => {
	let functionDeclaration = j(`async function generateStaticParams() {
		return (await getStaticPaths({})).paths;
	}`)
		.find(j.FunctionDeclaration)
		.paths()[0]!;

	return j.exportNamedDeclaration(functionDeclaration.value);
};

let getDataFunctionFactory = (
	j: JSCodeshift,
	decoratedFunctionName: string,
) => {
	let isSSR = decoratedFunctionName === 'getServerSideProps';

	return j(`
	const getData = async (ctx: ${
		isSSR ? 'GetServerSidePropsContext' : 'GetStaticPropsContext'
	}) => {
		const result = await ${decoratedFunctionName}(ctx);
		
		if("redirect" in result) {
			redirect(result.redirect.destination);	
		}
		
		if("notFound" in result) {
			notFound();
		}
		
		return "props" in result ? result.props : {};
	}`)
		.find(j.VariableDeclaration)
		.paths()[0]!;
};

let buildPageProps = (j: JSCodeshift) => {
	return j.objectPattern.from({
		properties: [
			j.objectProperty.from({
				key: j.identifier('params'),
				// renaming to avoid duplication of identifiers
				value: j.identifier('pageParams'),
			}),
			j.objectProperty.from({
				key: j.identifier('searchParams'),
				// renaming to avoid duplication of identifiers
				value: j.identifier('pageSearchParams'),
				shorthand: true,
			}),
		],
		typeAnnotation: j.tsTypeAnnotation(
			j.tsTypeReference(j.identifier('PageProps')),
		),
	});
};

let buildGetDataVariableDeclaration = (
	j: JSCodeshift,
	firstParam: Node | null,
) => {
	let callExpression = j.awaitExpression(
		j.callExpression(j.identifier('getData'), [j.identifier('legacyCtx')]),
	);

	let id = j.Identifier.check(firstParam)
		? j.identifier(firstParam.name)
		: j.ObjectPattern.check(firstParam)
			? j.objectPattern.from({
					...firstParam,
					typeAnnotation: null,
				})
			: null;

	return id === null
		? j.expressionStatement(callExpression)
		: j.variableDeclaration('const', [
				j.variableDeclarator(id, callExpression),
			]);
};

let buildBuildLegacyCtxVariableDeclaration = (j: JSCodeshift) => {
	return j.variableDeclaration('const', [
		j.variableDeclarator(
			j.identifier('legacyCtx'),
			j.callExpression(j.identifier('buildLegacyCtx'), [
				j.callExpression(j.identifier('headers'), []),
				j.callExpression(j.identifier('cookies'), []),
				j.identifier('pageParams'),
				j.identifier('pageSearchParams'),
			]),
		),
	]);
};

let addGenerateStaticParamsFunctionDeclaration: ModFunction<File, 'write'> = (
	j,
	root,
) => {
	let generateStaticParamsFunction = generateStaticParamsFunctionFactory(j);

	root.find(j.Program).forEach((program) => {
		program.value.body.splice(
			getFirstIndexAfterExportNamedFunctionDeclaration(
				j,
				root.find(j.Program).paths()[0]?.value.body ?? [],
				'getStaticPaths',
			),
			0,
			generateStaticParamsFunction,
		);
	});

	return [true, []];
};

let addPageParamsTypeAlias: ModFunction<File, 'write'> = (j, root) => {
	let pageParamsType = j.tsTypeAliasDeclaration(
		j.identifier('Params'),
		j.tsTypeLiteral([
			j.tsIndexSignature(
				[j.identifier('key: string')],
				j.tsTypeAnnotation(
					j.tsUnionType([
						j.tsStringKeyword(),
						j.tsArrayType(j.tsStringKeyword()),
						j.tsUndefinedKeyword(),
					]),
				),
			),
		]),
	);

	let pagePropsType = j.tsTypeAliasDeclaration(
		j.identifier('PageProps'),
		j.tsTypeLiteral([
			j.tsPropertySignature(
				j.identifier('params'),
				j.tsTypeAnnotation(j.tsTypeReference(j.identifier('Params'))),
			),
		]),
	);

	root.find(j.Program).forEach((program) => {
		program.value.body.splice(
			getFirstIndexAfterImports(j, root),
			0,
			...[pageParamsType, pagePropsType],
		);
	});

	return [true, []];
};

let addImportStatement: ModFunction<File, 'write'> = (j, root, settings) => {
	if (
		typeof settings.specifierNames !== 'string' ||
		typeof settings.sourceName !== 'string'
	) {
		return [false, []];
	}

	let specifiers = settings.specifierNames.split(',');

	let alreadyExists =
		root.find(j.ImportDeclaration, {
			specifiers: specifiers.map((s) => ({
				type: 'ImportSpecifier' as const,
				imported: {
					type: 'Identifier' as const,
					name: s,
				},
			})),
			source: {
				type: 'StringLiteral',
				value: settings.sourceName,
			},
		}).length !== 0;

	if (alreadyExists) {
		return [false, []];
	}

	let importDeclaration = j.importDeclaration(
		specifiers.map((s) => j.importSpecifier(j.identifier(s))),
		j.literal(settings.sourceName),
	);

	root.find(j.Program).get('body', 0).insertBefore(importDeclaration);

	return [false, []];
};

let addGetDataFunctionAsWrapper: ModFunction<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let functionName = settings.functionName as string;

	let getDataFunctionDeclaration = getDataFunctionFactory(j, functionName);
	let isSSR = functionName === 'getServerSideProps';

	let program = root.find(j.Program);

	let programNode = program.paths()[0] ?? null;

	if (programNode === null) {
		return [false, []];
	}

	programNode.value.body.splice(
		getFirstIndexAfterExportNamedFunctionDeclaration(
			j,
			root.find(j.Program).paths()[0]?.value.body ?? [],
			functionName,
		),
		0,
		getDataFunctionDeclaration.value,
	);

	return [
		true,
		[
			[
				addImportStatement,
				root,
				{
					specifierNames: 'notFound,redirect',
					sourceName: 'next/navigation',
				},
			],
			[
				addImportStatement,
				root,
				{
					specifierNames: isSSR
						? 'GetServerSidePropsContext'
						: 'GetStaticPropsContext',
					sourceName: 'next',
				},
			],
			[addPageParamsTypeAlias, root, {}],
		],
	];
};

let deepCloneCollection = <T extends ASTNode>(
	j: JSCodeshift,
	root: Collection<T>,
) => {
	return j(root.toSource());
};

let addGetDataFunctionInline: ModFunction<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let clonedFunctionCollection = deepCloneCollection(
		j,
		settings.function as Collection<FunctionDeclaration>,
	);

	let clonedFunctionDeclarationCollection = clonedFunctionCollection.find(
		j.FunctionDeclaration,
	);
	let clonedFArrowFunctionExpressionCollection =
		clonedFunctionCollection.find(j.ArrowFunctionExpression);

	let clonedFunction =
		clonedFunctionDeclarationCollection.paths()[0] ??
		clonedFArrowFunctionExpressionCollection.paths()[0] ??
		null;

	if (clonedFunction === null) {
		return [false, []];
	}

	let usedRedirect = false;
	let usedNotFound = false;

	clonedFunctionCollection
		.find(j.ReturnStatement)
		.forEach((returnStatementPath) => {
			let { argument } = returnStatementPath.value;

			if (j.ObjectExpression.check(argument)) {
				argument.properties.forEach((property) => {
					if (
						(!j.Property.check(property) &&
							!j.ObjectProperty.check(property)) ||
						!j.ObjectExpression.check(property.value) ||
						!j.Identifier.check(property.key)
					) {
						return;
					}

					let { key, value } = property;

					if (key.name === 'props') {
						returnStatementPath.value.argument = value;
					}

					if (key.name === 'redirect') {
						j(value)
							.find(j.ObjectProperty, {
								key: {
									type: 'Identifier',
									name: 'destination',
								},
							})
							.forEach((objectPropertyPath) => {
								if (
									!j.StringLiteral.check(
										objectPropertyPath.value.value,
									) &&
									!j.Identifier.check(
										objectPropertyPath.value.value,
									)
								) {
									return;
								}

								returnStatementPath.value.argument =
									j.callExpression(j.identifier('redirect'), [
										objectPropertyPath.value.value,
									]);
							});

						usedRedirect = true;
					}

					if (key.name === 'notFound') {
						returnStatementPath.value.argument = j.callExpression(
							j.identifier('notFound'),
							[],
						);

						usedNotFound = true;
					}
				});
			}
		});

	let contextTypeName =
		settings.functionName === 'getStaticProps'
			? 'GetStaticPropsContext'
			: 'GetServerSidePropsContext';

	let params = clonedFunction.value.params.length
		? clonedFunction.value.params
		: [j.identifier('props')];

	params.forEach((p) => {
		if (
			(j.ObjectPattern.check(p) || j.Identifier.check(p)) &&
			!p.typeAnnotation
		) {
			p.typeAnnotation = j.tsTypeAnnotation(
				j.tsTypeReference(j.identifier(contextTypeName)),
			);
		}
	});

	let getDataFunctionDeclaration = j.functionDeclaration.from({
		params,
		body:
			clonedFunction.value.body.type === 'BlockStatement'
				? clonedFunction.value.body
				: j.blockStatement([]),
		id: j.identifier('getData'),
		async: true,
	});

	let program = root.find(j.Program);

	let programNode = program.paths()[0] ?? null;

	if (programNode === null) {
		return [false, []];
	}

	programNode.value.body.splice(
		getFirstIndexAfterExportNamedFunctionDeclaration(
			j,
			root.find(j.Program).paths()[0]?.value.body ?? [],
			settings.functionName as string,
		),
		0,
		getDataFunctionDeclaration,
	);

	let lazyModFunctions: LazyModFunction[] = [];

	let specifierNames: string[] = [];

	if (usedNotFound) {
		specifierNames.push('notFound');
	}

	if (usedRedirect) {
		specifierNames.push('redirect');
	}

	if (specifierNames.length !== 0) {
		lazyModFunctions.push([
			addImportStatement,
			root,
			{
				specifierNames: specifierNames.join(),
				sourceName: 'next/navigation',
			},
		]);
	}

	if (params.length !== 0) {
		lazyModFunctions.push([
			addImportStatement,
			root,
			{
				specifierNames: contextTypeName,
				sourceName: 'next',
			},
		]);
	}

	lazyModFunctions.push([addPageParamsTypeAlias, root, {}]);

	return [true, lazyModFunctions];
};

let DATA_FETCHING_FUNCTION_NAMES = ['getServerSideProps', 'getStaticProps'];

export let findFunctionDeclarations: ModFunction<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let functionDeclarations = root.find(j.FunctionDeclaration);

	functionDeclarations.forEach((functionDeclarationPath) => {
		let functionDeclarationCollection = j(functionDeclarationPath);

		let { id } = functionDeclarationPath.value;

		if (!j.Identifier.check(id)) {
			return;
		}

		if (DATA_FETCHING_FUNCTION_NAMES.includes(id.name)) {
			lazyModFunctions.push(
				[
					findReturnStatements,
					functionDeclarationCollection,
					{
						...settings,
						functionName: id.name,
					},
				],
				[findComponentFunctionDefinition, root, settings],
			);
		}

		if (id.name === 'getStaticPaths') {
			let newSettings = { ...settings, functionName: 'getStaticPaths' };

			lazyModFunctions.push(
				[
					findReturnStatements,
					functionDeclarationCollection,
					newSettings,
				],
				[addGenerateStaticParamsFunctionDeclaration, root, newSettings],
			);
		}

		if (id.name === 'getStaticProps') {
			lazyModFunctions.push([
				addDynamicVariableDeclaration,
				root,
				settings,
			]);
		}
	});

	return [false, lazyModFunctions];
};

export let findArrowFunctionExpressions: ModFunction<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let variableDeclaratorCollection = root.find(j.VariableDeclarator);

	variableDeclaratorCollection
		.find(j.ArrowFunctionExpression)
		.forEach((arrowFunctionExpressionPath) => {
			let { id } = arrowFunctionExpressionPath.parent.value;

			if (!j.Identifier.check(id)) {
				return;
			}

			if (DATA_FETCHING_FUNCTION_NAMES.includes(id.name)) {
				lazyModFunctions.push(
					[
						findReturnStatements,
						j(arrowFunctionExpressionPath),
						{
							...settings,
							functionName: id.name,
						},
					],
					[findComponentFunctionDefinition, root, settings],
				);
			}

			if (id.name === 'getStaticPaths') {
				let newSettings = {
					...settings,
					functionName: 'getStaticPaths',
				};

				lazyModFunctions.push(
					[
						findReturnStatements,
						j(arrowFunctionExpressionPath),
						newSettings,
					],
					[
						addGenerateStaticParamsFunctionDeclaration,
						root,
						newSettings,
					],
				);
			}

			if (id.name === 'getStaticProps') {
				lazyModFunctions.push([
					addDynamicVariableDeclaration,
					root,
					settings,
				]);
			}
		});

	return [false, lazyModFunctions];
};

export let findReturnStatements: ModFunction<FunctionDeclaration, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let returnStatementCollection = root.find(j.ReturnStatement);

	if (settings.functionName === 'getStaticPaths') {
		lazyModFunctions.push([
			findFallbackObjectProperty,
			returnStatementCollection,
			settings,
		]);

		return [false, lazyModFunctions];
	}

	if (settings.functionName === 'getStaticProps') {
		lazyModFunctions.push([
			findRevalidateObjectProperty,
			returnStatementCollection,
			settings,
		]);
	}

	let functionCanBeInlined = returnStatementCollection.every(
		(returnStatementPath) =>
			j.ObjectExpression.check(returnStatementPath.value.argument),
	);

	let file = root.closest(j.File);

	let addGetDataLazyModFunction = functionCanBeInlined
		? addGetDataFunctionInline
		: addGetDataFunctionAsWrapper;
	lazyModFunctions.push([
		addGetDataLazyModFunction,
		file,
		{ ...settings, fileNode: file, function: root },
	]);

	return [false, lazyModFunctions];
};

export let addDynamicVariableDeclaration: ModFunction<File, 'write'> = (
	j,
	root,
) => {
	let exportNamedDeclarationAlreadyExists =
		root.find(j.ExportNamedDeclaration, {
			declaration: {
				declarations: [
					{
						type: 'VariableDeclarator',
						id: {
							type: 'Identifier',
							name: 'dynamic',
						},
					},
				],
			},
		})?.length !== 0;

	let dirtyFlag = false;

	if (exportNamedDeclarationAlreadyExists) {
		return [dirtyFlag, []];
	}

	let exportNamedDeclaration = j.exportNamedDeclaration(
		j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('dynamic'),
				j.stringLiteral('force-static'),
			),
		]),
	);

	root.find(j.Program).forEach((program) => {
		dirtyFlag = true;

		program.value.body.push(exportNamedDeclaration);
	});

	return [dirtyFlag, []];
};

/**
 * {
 *  fallback: boolean | 'blocking';
 * }
 */
export let findFallbackObjectProperty: ModFunction<any, 'read'> = (j, root) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let fileCollection = root.closest(j.File);
	root.find(j.ObjectProperty, {
		key: {
			type: 'Identifier',
			name: 'fallback',
		},
	}).forEach((objectPropertyPath) => {
		let objectPropertyValue = objectPropertyPath.value.value;

		if (
			objectPropertyValue.type !== 'BooleanLiteral' &&
			!(
				objectPropertyValue.type === 'StringLiteral' &&
				objectPropertyValue.value === 'blocking'
			)
		) {
			return;
		}

		let fallback = objectPropertyValue.value;

		lazyModFunctions.push([
			addFallbackVariableDeclaration,
			fileCollection,
			{ fallback },
		]);
	});

	return [false, lazyModFunctions];
};

/**
 * export const dynamicParams = true;
 */
export let addFallbackVariableDeclaration: ModFunction<any, 'write'> = (
	j,
	root,
	settings,
) => {
	let exportNamedDeclarationAlreadyExists =
		root.find(j.ExportNamedDeclaration, {
			declaration: {
				declarations: [
					{
						type: 'VariableDeclarator',
						id: {
							type: 'Identifier',
							name: 'dynamicParams',
						},
					},
				],
			},
		})?.length !== 0;

	if (exportNamedDeclarationAlreadyExists) {
		return [false, []];
	}

	let dynamicParams =
		settings.fallback === true || settings.fallback === 'blocking';

	let exportNamedDeclaration = j.exportNamedDeclaration(
		j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('dynamicParams'),
				j.booleanLiteral(dynamicParams),
			),
		]),
	);

	let dirtyFlag = false;

	root.find(j.Program).forEach((program) => {
		dirtyFlag = true;

		program.value.body.push(exportNamedDeclaration);
	});

	return [dirtyFlag, []];
};

export let findRevalidateObjectProperty: ModFunction<any, 'read'> = (
	j,
	root,
) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let fileCollection = root.closest(j.File);

	root.find(j.ObjectProperty, {
		key: {
			type: 'Identifier',
			name: 'revalidate',
		},
		value: {
			type: 'NumericLiteral',
		},
	}).forEach((objectPropertyPath) => {
		let objectPropertyCollection = j(objectPropertyPath);

		objectPropertyCollection
			.find(j.NumericLiteral)
			.forEach((numericLiteralPath) => {
				let numericLiteral = numericLiteralPath.value;

				let revalidate = String(numericLiteral.value);

				lazyModFunctions.push([
					addRevalidateVariableDeclaration,
					fileCollection,
					{ revalidate },
				]);
			});
	});

	return [false, lazyModFunctions];
};

export let addRevalidateVariableDeclaration: ModFunction<any, 'write'> = (
	j,
	root,
	settings,
) => {
	let exportNamedDeclarationAlreadyExists =
		root.find(j.ExportNamedDeclaration, {
			declaration: {
				declarations: [
					{
						type: 'VariableDeclarator',
						id: {
							type: 'Identifier',
							name: 'revalidate',
						},
					},
				],
			},
		})?.length !== 0;

	if (exportNamedDeclarationAlreadyExists) {
		return [false, []];
	}

	let revalidate = Number.parseInt(String(settings.revalidate) ?? '0', 10);

	let exportNamedDeclaration = j.exportNamedDeclaration(
		j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('revalidate'),
				j.numericLiteral(revalidate),
			),
		]),
	);

	let dirtyFlag = false;

	root.find(j.Program).forEach((program) => {
		dirtyFlag = true;

		program.value.body.push(exportNamedDeclaration);
	});

	return [dirtyFlag, []];
};

export let findComponentFunctionDefinition: ModFunction<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyModFunctions: LazyModFunction[] = [];

	let program = root.find(j.Program).paths()[0] ?? null;

	if (program === null) {
		return [false, []];
	}

	let defaultExport =
		root.find(j.ExportDefaultDeclaration).paths()[0] ?? null;
	let defaultExportDeclaration = defaultExport?.value.declaration ?? null;

	let pageComponentFunction:
		| FunctionDeclaration
		| ArrowFunctionExpression
		| FunctionExpression
		| null = null;

	if (defaultExportDeclaration?.type === 'FunctionDeclaration') {
		pageComponentFunction = defaultExportDeclaration;
	}

	if (defaultExportDeclaration?.type === 'Identifier') {
		let program = root.find(j.Program).paths()[0] ?? null;

		(program?.value.body ?? []).forEach((node) => {
			let _node = node;

			// node can be within ExportNamedDeclaration
			if (
				j.ExportNamedDeclaration.check(node) &&
				(j.FunctionDeclaration.check(node.declaration) ||
					j.VariableDeclaration.check(node.declaration))
			) {
				_node = node.declaration;
			}

			if (
				j.FunctionDeclaration.check(_node) &&
				_node.id?.name === defaultExportDeclaration.name
			) {
				pageComponentFunction = _node;
			}

			if (
				j.VariableDeclaration.check(_node) &&
				j.VariableDeclarator.check(_node.declarations[0]) &&
				j.Identifier.check(_node.declarations[0].id) &&
				_node.declarations[0].id.name ===
					defaultExportDeclaration.name &&
				(j.ArrowFunctionExpression.check(_node.declarations[0].init) ||
					j.FunctionExpression.check(_node.declarations[0].init))
			) {
				pageComponentFunction = _node.declarations[0].init;
			}
		});
	}

	if (pageComponentFunction === null) {
		return [false, []];
	}

	lazyModFunctions.push([
		addGetDataVariableDeclaration,
		j(pageComponentFunction),
		{ ...settings, fileNode: root },
	]);

	return [false, lazyModFunctions];
};

let addGetDataVariableDeclaration: ModFunction<
	FunctionDeclaration | ArrowFunctionExpression,
	'write'
> = (j, root, settings) => {
	let getDataAdded = false;
	let lazyModFunctions: LazyModFunction[] = [];

	root.forEach((path) => {
		let fn = path.value;

		if (
			!j.JSXElement.check(fn.body) &&
			!j.JSXFragment.check(fn.body) &&
			!j.BlockStatement.check(fn.body)
		) {
			return;
		}

		// if has implicit return, wrap in block
		if (j.JSXElement.check(fn.body) || j.JSXFragment.check(fn.body)) {
			fn.body = j.blockStatement.from({
				body: [j.returnStatement(fn.body)],
			});
		}

		let legacyCtxVariableDeclaration =
			buildBuildLegacyCtxVariableDeclaration(j);
		let getDataVariableDeclaration = buildGetDataVariableDeclaration(
			j,
			fn.params[0] ?? null,
		);

		if (j.BlockStatement.check(fn.body)) {
			fn.body.body.unshift(getDataVariableDeclaration);
			fn.body.body.unshift(legacyCtxVariableDeclaration);
		}

		fn.async = true;
		fn.params = [buildPageProps(j)];
		getDataAdded = true;
	});

	if (
		getDataAdded &&
		settings.fileNode &&
		typeof settings.fileNode === 'object'
	) {
		lazyModFunctions.push([
			addImportStatement,
			settings.fileNode,
			{ specifierNames: 'headers,cookies', sourceName: 'next/headers' },
		]);
		lazyModFunctions.push([
			addImportStatement,
			settings.fileNode,
			{
				specifierNames: 'buildLegacyCtx',
				sourceName: settings.buildLegacyCtxUtilAbsolutePath,
			},
		]);
	}

	return [getDataAdded, lazyModFunctions];
};

let getExportDefaultName = (
	j: JSCodeshift,
	declaration: unknown,
): string | null => {
	if (!j.ExportDefaultDeclaration.check(declaration)) {
		return null;
	}

	if (!j.Identifier.check(declaration.declaration)) {
		return null;
	}

	return declaration.declaration.name;
};

export function transform(
	jscodeshift: JSCodeshift,
	source: string,
	options: Record<string, string>,
): string | undefined {
	let dirtyFlag = false;
	let j = jscodeshift.withParser('tsx');
	let root = j(source);

	let hasGetStaticPathsFunction =
		root.find(j.FunctionDeclaration, {
			id: {
				type: 'Identifier',
				name: 'getStaticPaths',
			},
		}).length !== 0;

	let settings = {
		...options,
		includeParams: hasGetStaticPathsFunction,
	};

	let lazyModFunctions: LazyModFunction[] = [
		[findFunctionDeclarations, root, settings],
		[findArrowFunctionExpressions, root, settings],
	];

	let handleLazyModFunction = (lazyModFunction: LazyModFunction) => {
		let [modFunction, localCollection, localSettings] = lazyModFunction;

		let [localDirtyFlag, localLazyModFunctions] = modFunction(
			j,
			localCollection,
			localSettings,
		);

		dirtyFlag ||= localDirtyFlag;

		for (let localLazyModFunction of localLazyModFunctions) {
			handleLazyModFunction(localLazyModFunction);
		}
	};

	for (let lazyModFunction of lazyModFunctions) {
		handleLazyModFunction(lazyModFunction);
	}

	if (!dirtyFlag) {
		return undefined;
	}

	// move the default export behind getData
	root.find(j.Program).forEach((program) => {
		let body = program.value.body.slice();

		let index = body.findIndex((statement) =>
			j.ExportDefaultDeclaration.check(statement),
		);

		if (index === -1) {
			return;
		}

		let [exportDefaultDeclaration] = body.splice(index, 1);

		// e.g. export default Name;
		let exportDefaultName = getExportDefaultName(
			j,
			exportDefaultDeclaration,
		);

		if (!exportDefaultDeclaration) {
			return;
		}

		let namedFunctionIndex = body.findIndex((statement) => {
			if (j.FunctionDeclaration.check(statement)) {
				return (
					j.Identifier.check(statement.id) &&
					statement.id.name === exportDefaultName
				);
			}

			if (
				!j.ExportNamedDeclaration.check(statement) ||
				!j.VariableDeclaration.check(statement.declaration)
			) {
				return false;
			}

			let [declaration] = statement.declaration.declarations;

			if (
				!j.VariableDeclarator.check(declaration) ||
				!j.Identifier.check(declaration.id)
			) {
				return false;
			}

			return declaration.id.name === exportDefaultName;
		});

		if (namedFunctionIndex !== -1) {
			let [namedFunction] = body.splice(namedFunctionIndex, 1);

			let newIndex = getFirstIndexAfterExportNamedFunctionDeclaration(
				j,
				body,
				'getData',
			);

			if (newIndex === 0 || namedFunction === undefined) {
				return;
			}

			body.splice(newIndex, 0, namedFunction);
		}

		let newIndex = getFirstIndexAfterExportNamedFunctionDeclaration(
			j,
			body,
			exportDefaultName ?? 'getData',
		);

		if (newIndex === 0) {
			return;
		}

		body.splice(newIndex, 0, exportDefaultDeclaration);

		program.value.body = body;
	});

	return root.toSource();
}

let handleFile: HandleFile<Dependencies, State> = async (
	_,
	path,
	options,
	state,
) => {
	let { buildLegacyCtxUtilAbsolutePath } = options;
	if (typeof buildLegacyCtxUtilAbsolutePath !== 'string') {
		throw new Error(
			`Expected buildLegacyCtxUtilAbsolutePath to be a string, got ${typeof buildLegacyCtxUtilAbsolutePath}`,
		);
	}

	if (state === null) {
		return [];
	}

	let commands: FileCommand[] = [];

	if (state.step === RepomodStep.ADD_BUILD_LEGACY_CTX_UTIL) {
		commands.push({
			kind: 'upsertFile',
			path: buildLegacyCtxUtilAbsolutePath,
			options: {
				...options,
				fileContent: ADD_BUILD_LEGACY_CTX_UTIL_CONTENT,
			},
		});
	}

	commands.push({
		kind: 'upsertFile',
		path,
		options,
	});

	return commands;
};

let handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	data,
	options,
	state,
) => {
	let { buildLegacyCtxUtilAbsolutePath } = options;

	if (typeof buildLegacyCtxUtilAbsolutePath !== 'string') {
		throw new Error(
			`Expected buildLegacyCtxUtilAbsolutePath to be a string, got ${typeof buildLegacyCtxUtilAbsolutePath}`,
		);
	}

	if (state === null) {
		return noop;
	}

	if (
		state.step === RepomodStep.ADD_BUILD_LEGACY_CTX_UTIL &&
		typeof options.fileContent === 'string'
	) {
		state.step = RepomodStep.ADD_GET_SERVER_SIDE_DATA_HOOKS;
		return {
			kind: 'upsertData',
			path,
			data: options.fileContent,
		};
	}

	if (state.step === RepomodStep.ADD_GET_SERVER_SIDE_DATA_HOOKS) {
		let { jscodeshift } = api.getDependencies();

		let rewrittenData = transform(jscodeshift, data, {
			buildLegacyCtxUtilAbsolutePath,
		});
		if (rewrittenData === undefined) {
			return noop;
		}

		return {
			kind: 'upsertData',
			path,
			data: rewrittenData,
		};
	}

	return noop;
};

enum RepomodStep {
	ADD_BUILD_LEGACY_CTX_UTIL = 'ADD_BUILD_LEGACY_CTX_UTIL',
	ADD_GET_SERVER_SIDE_DATA_HOOKS = 'ADD_GET_SERVER_SIDE_DATA_HOOKS',
}

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/pages/**/*.{js,jsx,ts,tsx}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	initializeState: async (_, previousState) => {
		if (previousState === null) {
			return {
				step: RepomodStep.ADD_BUILD_LEGACY_CTX_UTIL,
			};
		}

		return previousState;
	},
	handleFile,
	handleData,
};
