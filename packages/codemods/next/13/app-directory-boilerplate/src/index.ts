import { format, join, parse, sep } from 'node:path';
import type { Filemod, HandleData, HandleFile } from '@codemod-com/filemod';
import type { fromMarkdown } from 'mdast-util-from-markdown';
import type {
	ArrowFunction,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	JsxOpeningElement,
	JsxSelfClosingElement,
	SourceFile,
} from 'ts-morph';
import tsmorph, { Node, SyntaxKind } from 'ts-morph';
import type { visit } from 'unist-util-visit';

type Root = ReturnType<typeof fromMarkdown>;

type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
	parseMdx?: (data: string) => Root;
	stringifyMdx?: (tree: Root) => string;
	visitMdxAst?: typeof visit;
}>;

let ROOT_ERROR_CONTENT = `
'use client';
import { useEffect } from 'react';
 
export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [ error ]);
 
  	return null;
}
`;

let ROOT_NOT_FOUND_CONTENT = `
export default function NotFound() {
    return null;
}
`;

let ROOT_LAYOUT_DEFAULT_CONTENT = `
export default function RootLayout({
	children,
  }: {
	children: React.ReactNode
  }) {
	return (
	  <html lang="en">
		<body>{children}</body>
	  </html>
	);
  };
`;

enum FilePurpose {
	// root directory
	ROOT_LAYOUT = 'ROOT_LAYOUT',
	ROOT_LAYOUT_COMPONENT = 'ROOT_LAYOUT_COMPONENT',
	ROOT_ERROR = 'ROOT_ERROR',
	ROOT_PAGE = 'ROOT_PAGE',
	ROOT_COMPONENTS = 'ROOT_COMPONENTS',
	ROOT_NOT_FOUND = 'ROOT_NOT_FOUND',
	// route directories
	ROUTE_PAGE = 'ROUTE_PAGE',
	ROUTE_COMPONENTS = 'ROUTE_COMPONENTS',
}

let map = new Map([
	// root directory
	[FilePurpose.ROOT_LAYOUT, ROOT_LAYOUT_DEFAULT_CONTENT],
	[FilePurpose.ROOT_LAYOUT_COMPONENT, ''],
	[FilePurpose.ROOT_ERROR, ROOT_ERROR_CONTENT],
	[FilePurpose.ROOT_PAGE, ''],
	[FilePurpose.ROOT_COMPONENTS, ''],
	[FilePurpose.ROOT_NOT_FOUND, ROOT_NOT_FOUND_CONTENT],
	// route directories
	[FilePurpose.ROUTE_PAGE, ''],
	[FilePurpose.ROUTE_COMPONENTS, ''],
]);

let EXTENSION = '.tsx';

type State = {
	underscoreAppPath: string | null;
	underscoreAppData: string | null;
	underscoreDocumentPath: string | null;
	underscoreDocumentData: string | null;
};

type FileAPI = Parameters<HandleFile<Dependencies, State>>[0];
type DataAPI = Parameters<HandleData<Dependencies, State>>[0];

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];
type DataCommand = Awaited<ReturnType<HandleData<Dependencies, State>>>;

let removeUnusedImports = (sourceFile: SourceFile) => {
	sourceFile.getImportDeclarations().forEach((importDeclaration) => {
		let defaultImport = importDeclaration.getDefaultImport();

		if (
			defaultImport &&
			defaultImport.findReferencesAsNodes().length === 1
		) {
			importDeclaration.remove();
			return;
		}

		let namedImports = importDeclaration.getNamedImports();

		if (namedImports.length === 0) {
			return;
		}

		namedImports.forEach((namedImport) => {
			let nameNode = namedImport.getNameNode();

			if (nameNode.findReferencesAsNodes().length !== 1) {
				return;
			}

			namedImport.remove();
		});

		if (
			importDeclaration.getImportClause() !== undefined ||
			importDeclaration.getNamedImports().length !== 0
		) {
			return;
		}

		importDeclaration.remove();
	});
};

let buildComponentsFileData = (
	api: DataAPI,
	path: string,
	options: Readonly<Record<string, string | number | boolean | undefined>>,
	filePurpose: FilePurpose.ROOT_COMPONENTS | FilePurpose.ROUTE_COMPONENTS,
): DataCommand => {
	let { tsmorph, parseMdx, stringifyMdx, visitMdxAst } =
		api.getDependencies();

	let sourcingStatementInserted = false;

	let rewriteWithTsMorph = (input: string) => {
		let project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		let oldPath =
			typeof options.oldPath === 'string' ? options.oldPath : null;

		let sourceFile = project.createSourceFile(
			oldPath?.replace(/\.mdx$/, '.tsx') ?? '',
			input,
		);

		sourceFile.getFunctions().forEach((fn) => {
			let id = fn.getName() ?? '';

			if (
				[
					'getStaticProps',
					'getServerSideProps',
					'getStaticPaths',
					'generateMetadata',
				].includes(id)
			) {
				fn.remove();
			}
		});

		sourceFile.getVariableStatements().forEach((statement) => {
			statement.getDeclarations().forEach((declaration) => {
				let id = declaration.getName() ?? '';

				if (
					[
						'getStaticProps',
						'getServerSideProps',
						'getStaticPaths',
						'generateMetadata',
						'metadata',
					].includes(id)
				) {
					declaration.remove();
				}
			});
		});

		sourceFile
			.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
			.filter(
				(jsxOpeningElement) =>
					jsxOpeningElement.getTagNameNode().getText() === 'Head',
			)
			.map((declaration) => {
				return declaration.getFirstAncestorByKind(
					SyntaxKind.JsxElement,
				);
			})
			.forEach((jsxElement) => {
				let parenthesizedExpressionParent =
					jsxElement?.getParentIfKind(
						SyntaxKind.ParenthesizedExpression,
					) ?? null;

				if (parenthesizedExpressionParent !== null) {
					parenthesizedExpressionParent.replaceWithText('null');

					return;
				}

				jsxElement?.replaceWithText('');
			});

		if (filePurpose === FilePurpose.ROUTE_COMPONENTS) {
			sourceFile.getImportDeclarations().forEach((declaration) => {
				let moduleSpecifier = declaration.getModuleSpecifierValue();

				if (moduleSpecifier.startsWith('./')) {
					declaration.setModuleSpecifier(`.${moduleSpecifier}`);
				} else if (moduleSpecifier.startsWith('../')) {
					declaration.setModuleSpecifier(`../${moduleSpecifier}`);
				}
			});
		}

		if (!sourcingStatementInserted) {
			sourceFile.insertStatements(0, [
				`'use client';`,
				`// This file has been sourced from: ${options.oldPath}`,
			]);

			sourcingStatementInserted = true;
		}

		removeUnusedImports(sourceFile);

		return sourceFile.getFullText();
	};

	if (path.endsWith('.mdx')) {
		if (parseMdx && stringifyMdx && visitMdxAst) {
			let tree = parseMdx(
				typeof options.oldData === 'string' ? options.oldData : '',
			);

			visitMdxAst(tree, (node) => {
				if (node.type === 'mdxjsEsm') {
					node.value = rewriteWithTsMorph(node.value);

					delete node.data;
					delete node.position;

					return 'skip';
				}
			});

			let data = stringifyMdx(tree);

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		return {
			kind: 'noop',
		};
	}

	return {
		kind: 'upsertData',
		path,
		data: rewriteWithTsMorph(String(options.oldData ?? '')),
	};
};

let getPageConfig = (fileContent: string, filePath: string): string => {
	let project = new tsmorph.Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	let sourceFile = project.createSourceFile(filePath, fileContent);

	let nextjsConfig = '';

	sourceFile.getFunctions().forEach((fn) => {
		if (fn.isDefaultExport()) {
			return;
		}

		let id = fn.getName() ?? '';

		if (
			['getStaticProps', 'getServerSideProps', 'getStaticPaths'].includes(
				id,
			)
		) {
			fn.setIsExported(false);
			nextjsConfig += `${fn.getText()} \n`;
		}
	});

	sourceFile.getVariableStatements().forEach((statement) => {
		statement.getDeclarations().forEach((declaration) => {
			let id = declaration.getName() ?? '';

			if (
				[
					'getStaticProps',
					'getServerSideProps',
					'getStaticPaths',
				].includes(id) &&
				declaration.hasExportKeyword()
			) {
				statement.setIsExported(false);
				nextjsConfig += `${statement.getText()} \n`;
			}
		});
	});

	return nextjsConfig;
};

let buildPageFileData = (
	api: DataAPI,
	path: string,
	options: Readonly<Record<string, string | number | boolean | undefined>>,
	filePurpose: FilePurpose.ROOT_PAGE | FilePurpose.ROUTE_PAGE,
): DataCommand => {
	let { tsmorph, parseMdx, stringifyMdx, visitMdxAst } =
		api.getDependencies();

	let sourcingStatementInserted = false;

	let rewriteWithTsMorph = (input: string): string => {
		let project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		let oldPath =
			typeof options.oldPath === 'string'
				? options.oldPath?.replace(/\.mdx$/, '.tsx')
				: '';

		let nextjsConfig = getPageConfig(input, oldPath);

		let sourceFile = project.createSourceFile(oldPath, nextjsConfig);

		// removeUnneededImportDeclarations(sourceFile);

		sourceFile
			.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
			.filter(
				(jsxOpeningElement) =>
					jsxOpeningElement.getTagNameNode().getText() === 'Head',
			)
			.map((declaration) => {
				return declaration.getFirstAncestorByKind(
					SyntaxKind.JsxElement,
				);
			})
			.forEach((jsxElement) => {
				let parenthesizedExpressionParent =
					jsxElement?.getParentIfKind(
						SyntaxKind.ParenthesizedExpression,
					) ?? null;

				if (parenthesizedExpressionParent !== null) {
					parenthesizedExpressionParent.replaceWithText('null');

					return;
				}

				jsxElement?.replaceWithText('');
			});

		if (filePurpose === FilePurpose.ROUTE_PAGE) {
			sourceFile.getImportDeclarations().forEach((declaration) => {
				let moduleSpecifier = declaration.getModuleSpecifierValue();

				if (moduleSpecifier.startsWith('./')) {
					declaration.setModuleSpecifier(`.${moduleSpecifier}`);
				} else if (moduleSpecifier.startsWith('../')) {
					declaration.setModuleSpecifier(`../${moduleSpecifier}`);
				}
			});
		}

		sourceFile.addImportDeclaration({
			moduleSpecifier: './components',
			defaultImport: 'Components',
		});

		sourceFile.getStatementsWithComments().forEach((statement, index) => {
			if (tsmorph.Node.isVariableStatement(statement)) {
				let declarations = statement
					.getDeclarationList()
					.getDeclarations();

				let getServerSidePropsUsed = declarations.some(
					(declaration) =>
						declaration.getName() === 'getServerSideProps',
				);

				if (getServerSidePropsUsed) {
					sourceFile.insertStatements(
						index,
						'// TODO reimplement getServerSideProps with custom logic\n',
					);
				}
			}
		});

		if (!sourcingStatementInserted) {
			sourceFile.insertStatements(
				0,
				`// This file has been sourced from: ${options.oldPath}`,
			);

			sourcingStatementInserted = true;
		}

		sourceFile.addStatements(`export default async function Page(props: any) {
			return <Components {...props} />;
		}`);

		removeUnusedImports(sourceFile);

		return sourceFile.getFullText();
	};

	if (path.endsWith('.mdx')) {
		if (parseMdx && stringifyMdx && visitMdxAst) {
			let tree = parseMdx(String(options.oldData ?? ''));

			visitMdxAst(tree, (node) => {
				if (node.type === 'mdxjsEsm') {
					node.value = rewriteWithTsMorph(node.value);

					delete node.data;
					delete node.position;

					return 'skip';
				}
			});

			let data = stringifyMdx(tree);

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		return {
			kind: 'noop',
		};
	}

	return {
		kind: 'upsertData',
		path,
		data: rewriteWithTsMorph(String(options.oldData ?? '')),
	};
};

let resolveExtensionlessFilePath = (
	extensionlessFilePath: string,
	fileApi: FileAPI,
): string | null => {
	let resolvedPath: string | null = null;

	['jsx', 'tsx', 'js', 'ts'].forEach((ext) => {
		let path = `${extensionlessFilePath}.${ext}`;

		if (fileApi.exists(path)) {
			resolvedPath = path;
		}
	});

	return resolvedPath;
};

let findJsxTagsByImportName = (
	sourceFile: SourceFile,
	moduleSpecifier: string,
) => {
	let importDeclarations = sourceFile.getImportDeclarations();

	let importDeclaration = importDeclarations.find((importDeclaration) => {
		let moduleSpecifierText = importDeclaration
			.getModuleSpecifier()
			.getText();

		return (
			moduleSpecifierText.substring(1, moduleSpecifierText.length - 1) ===
			moduleSpecifier
		);
	});

	if (importDeclaration === undefined) {
		return [];
	}

	let importedIdentifiers: Identifier[] = [];

	let defaultImport = importDeclaration?.getDefaultImport();

	if (defaultImport) {
		importedIdentifiers.push(defaultImport);
	}

	(importDeclaration?.getNamedImports() ?? []).forEach((namedImport) => {
		importedIdentifiers.push(namedImport.getNameNode());
	});

	let jsxTags: (JsxSelfClosingElement | JsxOpeningElement)[] = [];

	importedIdentifiers.forEach((identifier) => {
		let refs = identifier.findReferencesAsNodes();

		refs.forEach((ref) => {
			let parent = ref.getParent();

			if (
				Node.isJsxSelfClosingElement(parent) ||
				Node.isJsxOpeningElement(parent)
			) {
				jsxTags.push(parent);
			}
		});
	});

	return jsxTags;
};

let replaceNextDocumentJsxTags = (sourceFile: SourceFile) => {
	let nextDocumentJsxTags = findJsxTagsByImportName(
		sourceFile,
		'next/document',
	);

	nextDocumentJsxTags.forEach((jsxTag) => {
		let tagNameNode = jsxTag.getTagNameNode();
		let tagName = tagNameNode.getText();

		if (tagName === 'Main') {
			return;
		}

		if (tagName === 'NextScript') {
			jsxTag.replaceWithText('');
			return;
		}

		if (
			Node.isIdentifier(tagNameNode) &&
			['Html', 'Head'].includes(tagName)
		) {
			tagNameNode.rename(tagName.toLowerCase());
		}
	});
};

let removeNextDocumentImport = (sourceFile: SourceFile) => {
	let importDeclarations = sourceFile.getImportDeclarations();

	let importDeclaration = importDeclarations.find((importDeclaration) => {
		let moduleSpecifierText = importDeclaration
			.getModuleSpecifier()
			.getText();

		return (
			moduleSpecifierText.substring(1, moduleSpecifierText.length - 1) ===
			'next/document'
		);
	});

	importDeclaration?.remove();
};

let updateLayoutComponent = (sourceFile: SourceFile) => {
	let layoutComponent = sourceFile
		.getFunctions()
		.find((f) => f.isDefaultExport());

	if (layoutComponent === undefined) {
		return;
	}

	layoutComponent.rename('RootLayout');

	let param = layoutComponent.getParameters()[0];

	if (param === undefined) {
		layoutComponent.addParameter({
			name: '{children}',
			type: `{
				children: React.ReactNode
			}`,
		});
		return;
	}

	param.replaceWithText(`{
		children,
	}: {
		children: React.ReactNode
	}`);
};

type ComponentFunction =
	| ArrowFunction
	| FunctionExpression
	| FunctionDeclaration;

let findComponent = (sourceFile: SourceFile): ComponentFunction | null => {
	let defaultExportedFunctionDeclaration = sourceFile
		.getFunctions()
		.find((f) => f.isDefaultExport());

	if (defaultExportedFunctionDeclaration !== undefined) {
		return defaultExportedFunctionDeclaration;
	}

	let exportAssignment = sourceFile
		.getStatements()
		.find((s) => Node.isExportAssignment(s));

	let declarations =
		exportAssignment
			?.getFirstDescendantByKind(SyntaxKind.Identifier)
			?.getSymbol()
			?.getDeclarations() ?? [];

	let component:
		| ArrowFunction
		| FunctionExpression
		| FunctionDeclaration
		| undefined;

	declarations.forEach((d) => {
		if (Node.isVariableDeclaration(d)) {
			let initializer = d?.getInitializer();

			if (
				Node.isArrowFunction(initializer) ||
				Node.isFunctionExpression(initializer)
			) {
				component = initializer;
				return;
			}
		}

		if (Node.isFunctionDeclaration(d)) {
			component = d;
		}
	});

	return component ?? null;
};

let buildLayoutClientComponentFromUnderscoreApp = (sourceFile: SourceFile) => {
	let component = findComponent(sourceFile);

	if (component === null) {
		return;
	}

	if (!Node.isArrowFunction(component)) {
		component.rename('LayoutClientComponent');
	}

	let param = component.getParameters()[0];
	param?.remove();

	component.addParameter({
		name: '{children}',
		type: `{
				children: React.ReactNode
			}`,
	});

	let returnStatement = component.getFirstDescendantByKind(
		SyntaxKind.ReturnStatement,
	);

	returnStatement
		?.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
		.find(
			(jsxElement) =>
				jsxElement.getTagNameNode().getText() === 'Component',
		)
		?.replaceWithText('<>{ children }</>');

	removeUnusedImports(sourceFile);

	sourceFile.insertStatements(0, '"use client" \n');
};

let injectLayoutClientComponent = (sourceFile: SourceFile) => {
	let mainJsxTag = sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
		.find((jsxElement) => jsxElement.getTagNameNode().getText() === 'Main');

	mainJsxTag?.replaceWithText(
		'<LayoutClientComponent> { children } </LayoutClientComponent>',
	);

	sourceFile.insertStatements(
		0,
		'import LayoutClientComponent from "./layout-client-component"',
	);
};

let handleFile: Filemod<Dependencies, State>['handleFile'] = async (
	api,
	path,
	options,
	state,
) => {
	let parsedPath = parse(path);
	let directoryNames = parsedPath.dir.split(sep);
	let endsWithPages =
		directoryNames.length > 0 &&
		directoryNames.lastIndexOf('pages') === directoryNames.length - 1;

	let nameIsIndex = parsedPath.name === 'index';

	// reads underscoreAppData & underscoreDocumentData files and stores the data to the state, because files can be deleted during codemod execution
	if (
		state !== null &&
		state.underscoreAppData === null &&
		state.underscoreDocumentData === null
	) {
		let extensiolessUnderscoreDocumentPath = join(
			parsedPath.dir,
			'_document',
		);

		let underscoreDocumentPath = resolveExtensionlessFilePath(
			extensiolessUnderscoreDocumentPath,
			api,
		);

		let extensionlessUnderscoreAppPath = join(parsedPath.dir, '_app');

		let underscoreAppPath = resolveExtensionlessFilePath(
			extensionlessUnderscoreAppPath,
			api,
		);

		if (underscoreAppPath !== null && state !== null) {
			state.underscoreAppData = await api.readFile(underscoreAppPath);
			state.underscoreAppPath = underscoreAppPath;
		}

		if (underscoreDocumentPath !== null && state !== null) {
			state.underscoreDocumentData = await api.readFile(
				underscoreDocumentPath,
			);
			state.underscoreDocumentPath = underscoreDocumentPath;
		}
	}

	if (endsWithPages && nameIsIndex) {
		let newDir = directoryNames.slice(0, -1).concat('app').join(sep);

		let rootErrorPath = format({
			root: parsedPath.root,
			dir: newDir,
			ext: EXTENSION,
			name: 'error',
		});

		let rootNotFoundPath = format({
			root: parsedPath.root,
			dir: newDir,
			ext: EXTENSION,
			name: 'not-found',
		});

		let jsxErrorPath = format({
			...parsedPath,
			name: '_error',
			ext: '.jsx',
			base: undefined,
		});

		let tsxErrorPath = format({
			...parsedPath,
			name: '_error',
			ext: '.tsx',
			base: undefined,
		});

		let rootErrorPathIncluded =
			api.exists(jsxErrorPath) || api.exists(tsxErrorPath);

		let jsxNotFoundPath = format({
			...parsedPath,
			name: '_404',
			ext: '.jsx',
			base: undefined,
		});

		let tsxNotFoundPath = format({
			...parsedPath,
			name: '_404',
			ext: '.tsx',
			base: undefined,
		});

		let rootNotFoundPathIncluded =
			api.exists(jsxNotFoundPath) || api.exists(tsxNotFoundPath);

		let oldData = await api.readFile(path);
		let commands: FileCommand[] = [
			{
				kind: 'upsertFile' as const,
				path: format({
					root: parsedPath.root,
					dir: newDir,
					ext: EXTENSION,
					name: 'page',
				}),
				options: {
					...options,
					filePurpose: FilePurpose.ROOT_PAGE,
					oldPath: path,
					oldData,
				},
			},
			{
				kind: 'upsertFile' as const,
				path: format({
					root: parsedPath.root,
					dir: newDir,
					ext: EXTENSION,
					name: 'components',
				}),
				options: {
					...options,
					filePurpose: FilePurpose.ROOT_COMPONENTS,
					oldPath: path,
					oldData,
				},
			},
			{
				kind: 'deleteFile' as const,
				path,
			},
		];

		if (
			state !== null &&
			state.underscoreAppPath !== null &&
			state.underscoreDocumentPath !== null
		) {
			commands.unshift({
				kind: 'upsertFile' as const,
				path: format({
					root: parsedPath.root,
					dir: newDir,
					ext: EXTENSION,
					name: 'layout-client-component',
				}),
				options: {
					...options,
					underscoreAppPath: state.underscoreAppPath,
					underscoreAppData: state.underscoreAppData,
					filePurpose: FilePurpose.ROOT_LAYOUT_COMPONENT,
				},
			});
		}

		commands.unshift({
			kind: 'upsertFile' as const,
			path: format({
				root: parsedPath.root,
				dir: newDir,
				ext: EXTENSION,
				name: 'layout',
			}),
			options: {
				...options,
				...(state !== null &&
					state.underscoreDocumentPath !== null &&
					state.underscoreDocumentData !== null && {
						underscoreDocumentPath: state.underscoreDocumentPath,
						underscoreDocumentData: state.underscoreDocumentData,
					}),
				filePurpose: FilePurpose.ROOT_LAYOUT,
			},
		});

		if (rootErrorPathIncluded) {
			commands.push({
				kind: 'upsertFile' as const,
				path: rootErrorPath,
				options: {
					...options,
					filePurpose: FilePurpose.ROOT_ERROR,
				},
			});
		}

		if (rootNotFoundPathIncluded) {
			commands.push({
				kind: 'upsertFile' as const,
				path: rootNotFoundPath,
				options: {
					...options,
					filePurpose: FilePurpose.ROOT_NOT_FOUND,
				},
			});
		}

		return commands;
	}

	if (!endsWithPages) {
		let newDirArr = directoryNames.map((name) =>
			name.replace('pages', 'app'),
		);

		if (!nameIsIndex) {
			newDirArr.push(parsedPath.name);
		}

		let newDir = newDirArr.join(sep);

		let oldData = await api.readFile(path);

		let commands: FileCommand[] = [
			{
				kind: 'upsertFile',
				path: format({
					root: parsedPath.root,
					dir: newDir,
					ext: parsedPath.ext === '.mdx' ? '.mdx' : '.tsx',
					name: 'page',
				}),
				options: {
					...options,
					filePurpose: FilePurpose.ROUTE_PAGE,
					oldPath: path,
					oldData,
				},
			},
			{
				kind: 'upsertFile',
				path: format({
					root: parsedPath.root,
					dir: newDir,
					ext: parsedPath.ext === '.mdx' ? '.mdx' : '.tsx',
					name: 'components',
				}),
				options: {
					...options,
					filePurpose: FilePurpose.ROUTE_COMPONENTS,
					oldPath: path,
					oldData,
				},
			},
			{
				kind: 'deleteFile' as const,
				path,
			},
		];

		return commands;
	}

	if (parsedPath.name === '_app' || parsedPath.name === '_document') {
		return [
			{
				kind: 'deleteFile',
				path,
			},
		];
	}

	return [];
};

let handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	__,
	options,
) => {
	try {
		let filePurpose = (options.filePurpose ?? null) as FilePurpose | null;

		if (filePurpose === null) {
			return {
				kind: 'noop',
			};
		}

		let content = map.get(filePurpose) ?? null;

		if (content === null) {
			return {
				kind: 'noop',
			};
		}

		if (
			(filePurpose === FilePurpose.ROOT_COMPONENTS ||
				filePurpose === FilePurpose.ROUTE_COMPONENTS) &&
			options.oldPath
		) {
			return buildComponentsFileData(api, path, options, filePurpose);
		}

		if (
			(filePurpose === FilePurpose.ROUTE_PAGE ||
				filePurpose === FilePurpose.ROOT_PAGE) &&
			options.oldPath
		) {
			return buildPageFileData(api, path, options, filePurpose);
		}

		if (filePurpose === FilePurpose.ROOT_LAYOUT) {
			let { tsmorph } = api.getDependencies();

			if (options.underscoreDocumentData === undefined) {
				return {
					kind: 'upsertData',
					path,
					data: map.get(FilePurpose.ROOT_LAYOUT) ?? '',
				};
			}

			let project = new tsmorph.Project({
				useInMemoryFileSystem: true,
				skipFileDependencyResolution: true,
				compilerOptions: {
					allowJs: true,
				},
			});

			let sourceFile = project.createSourceFile(
				path,
				String(options.underscoreDocumentData),
			);

			replaceNextDocumentJsxTags(sourceFile);
			removeNextDocumentImport(sourceFile);
			updateLayoutComponent(sourceFile);
			injectLayoutClientComponent(sourceFile);

			return {
				kind: 'upsertData',
				path,
				data: sourceFile.getFullText(),
			};
		}

		if (
			filePurpose === FilePurpose.ROOT_LAYOUT_COMPONENT &&
			options.underscoreAppData &&
			options.underscoreAppPath
		) {
			let { tsmorph } = api.getDependencies();

			let project = new tsmorph.Project({
				useInMemoryFileSystem: true,
				skipFileDependencyResolution: true,
				compilerOptions: {
					allowJs: true,
				},
			});

			let underscoreAppFile = project.createSourceFile(
				String(options.underscoreAppPath),
				String(options.underscoreAppData),
			);

			buildLayoutClientComponentFromUnderscoreApp(underscoreAppFile);

			return {
				kind: 'upsertData',
				path,
				data: underscoreAppFile.getFullText(),
			};
		}

		return {
			kind: 'upsertData',
			path,
			data: content,
		};
	} catch (error) {
		return {
			kind: 'noop',
		};
	}
};

let initializeState: Filemod<
	Dependencies,
	State
>['initializeState'] = async () => {
	return {
		underscoreAppData: null,
		underscoreAppPath: null,
		underscoreDocumentData: null,
		underscoreDocumentPath: null,
	};
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/pages/**/*.{js,jsx,ts,tsx,cjs,mjs,mdx}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	initializeState,
	handleFile,
	handleData,
};
