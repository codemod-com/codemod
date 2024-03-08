import { format, parse, sep } from "node:path";
import type { Filemod, HandleData, HandleFile } from "@codemod-com/filemod";
import type { Identifier, SourceFile } from "ts-morph";
import tsmorph, { Node, SyntaxKind } from "ts-morph";

// eslint-disable-next-line @typescript-eslint/ban-types
type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
}>;

const removeLeadingLineBreaks = (input: string): string => {
	return input.replace(/^\n+/, "");
};

enum FilePurpose {
	ORIGINAL_PAGE = "ORIGINAL_PAGE",
	// route directories
	ROUTE_PAGE = "ROUTE_PAGE",
}

const map = new Map([
	[FilePurpose.ORIGINAL_PAGE, ""],
	[FilePurpose.ROUTE_PAGE, ""],
]);

type State = Record<string, never>;

type DataAPI = Parameters<HandleData<Dependencies, State>>[0];

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];
type DataCommand = Awaited<ReturnType<HandleData<Dependencies, State>>>;

const addUseClientStatement = (
	oldPath: string,
	oldData: string,
): DataCommand => {
	const project = new tsmorph.Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	const sourceFile = project.createSourceFile(oldPath ?? "", oldData);

	const hasUseClient = sourceFile
		.getDescendantsOfKind(SyntaxKind.StringLiteral)
		.some((node) => {
			const literal = node.getLiteralText();
			return literal === "use client";
		});

	if (!hasUseClient) {
		sourceFile.insertStatements(0, `'use client';`);
	}

	return {
		kind: "upsertData",
		path: oldPath,
		data: sourceFile.getFullText(),
	};
};

const ROUTE_SEGMENT_CONFIG_OPTIONS = [
	"dynamic",
	"dynamicParams",
	"revalidate",
	"fetchCache",
	"runtime",
	"preferredRegion",
	"maxDuration",
];

const getAncestorByDeclaration = (declarationNode: Node): Node | null => {
	let ancestor: Node | null = null;

	const parameter = Node.isParameterDeclaration(declarationNode)
		? declarationNode
		: declarationNode.getFirstAncestorByKind(SyntaxKind.Parameter);
	const importDeclaration = declarationNode.getFirstAncestorByKind(
		SyntaxKind.ImportDeclaration,
	);

	if (parameter !== undefined) {
		ancestor = parameter;
	} else if (importDeclaration !== undefined) {
		ancestor = importDeclaration;
	} else if (Node.isFunctionDeclaration(declarationNode)) {
		ancestor = declarationNode;
	} else if (Node.isVariableDeclaration(declarationNode)) {
		// variable statement
		ancestor = declarationNode.getParent()?.getParent() ?? null;
	} else if (Node.isBindingElement(declarationNode)) {
		ancestor =
			declarationNode.getFirstAncestorByKind(SyntaxKind.VariableStatement) ??
			null;
	}

	return ancestor;
};
const DEPENDENCY_TREE_MAX_DEPTH = 3;

const getDependenciesForIdentifiers = (
	identifiers: ReadonlyArray<Identifier>,
	depth = 0,
) => {
	if (depth > DEPENDENCY_TREE_MAX_DEPTH) {
		return {};
	}

	const dependencies: Record<string, string> = {};

	identifiers.forEach((identifier) => {
		const parent = identifier.getParent();

		if (Node.isParameterDeclaration(parent)) {
			return;
		}

		if (
			(Node.isPropertyAccessExpression(parent) ||
				Node.isElementAccessExpression(parent)) &&
			identifier.getChildIndex() !== 0
		) {
			return;
		}

		if (
			Node.isPropertyAssignment(parent) &&
			parent.getNameNode() === identifier
		) {
			return;
		}

		const [firstDeclaration] = identifier.getSymbol()?.getDeclarations() ?? [];

		const localSourceFile = identifier.getFirstAncestorByKind(
			SyntaxKind.SourceFile,
		);

		// check if declaration exists in current sourceFile
		if (
			firstDeclaration === undefined ||
			firstDeclaration.getFirstAncestorByKind(SyntaxKind.SourceFile) !==
				localSourceFile
		) {
			return;
		}

		const ancestor = getAncestorByDeclaration(firstDeclaration);

		if (ancestor === null) {
			return;
		}

		dependencies[identifier.getText()] = ancestor.getText();

		// recursivelly check for dependencies until reached parameter or import
		if (
			Node.isImportDeclaration(ancestor) ||
			Node.isParameterDeclaration(ancestor)
		) {
			return;
		}

		const ancestorIdentifiers = ancestor
			.getDescendantsOfKind(SyntaxKind.Identifier)
			.filter((i) => {
				if (i.getText() === identifier.getText()) {
					return false;
				}

				if (ancestor && Node.isFunctionDeclaration(ancestor)) {
					const declaration = i.getSymbol()?.getDeclarations()[0];

					// ensure we dont collect identifiers from function inner scope in nested functions
					if (
						declaration?.getFirstAncestorByKind(
							SyntaxKind.FunctionDeclaration,
						) === ancestor
					) {
						return false;
					}
				}

				const parent = i.getParent();

				return (
					!Node.isBindingElement(parent) &&
					!Node.isPropertyAssignment(parent) &&
					!(Node.isPropertyAccessExpression(parent) && i.getChildIndex() !== 0)
				);
			});

		const dependenciesOfAncestor = getDependenciesForIdentifiers(
			ancestorIdentifiers,
			depth + 1,
		);
		Object.assign(dependencies, dependenciesOfAncestor);
	});

	return dependencies;
};

const getRouteSegmentConfig = (sourceFile: SourceFile): string => {
	let nextjsConfig = "";

	sourceFile.getVariableStatements().forEach((statement) => {
		statement.getDeclarations().forEach((declaration) => {
			const id = declaration.getName() ?? "";

			if (
				declaration.hasExportKeyword() &&
				ROUTE_SEGMENT_CONFIG_OPTIONS.includes(id)
			) {
				nextjsConfig += `${statement.getText()} \n`;
			}
		});
	});

	return nextjsConfig;
};

const getServerSideDataHookWithDeps = (sourceFile: SourceFile) => {
	let dataHooksWithDeps = "";

	const getDataAF = sourceFile
		.getDescendantsOfKind(SyntaxKind.ArrowFunction)
		.find((AF) => {
			const parent = AF.getParent();
			return (
				Node.isVariableDeclaration(parent) && parent.getName() === "getData"
			);
		});

	if (getDataAF === undefined) {
		return dataHooksWithDeps;
	}

	const identifiers = getDataAF
		.getBody()
		.getDescendantsOfKind(SyntaxKind.Identifier);

	const dependencies = getDependenciesForIdentifiers(identifiers);

	dataHooksWithDeps += Object.values(dependencies).reverse().join("\n");
	dataHooksWithDeps += `${
		getDataAF.getFirstAncestorByKind(SyntaxKind.VariableStatement)?.getText() ??
		""
	} \n`;

	return dataHooksWithDeps;
};

const getPositionAfterImports = (sourceFile: SourceFile): number => {
	const lastImportDeclaration =
		sourceFile.getLastChildByKind(SyntaxKind.ImportDeclaration) ?? null;

	return (lastImportDeclaration?.getChildIndex() ?? 0) + 1;
};

const buildPageFileData = (
	api: DataAPI,
	path: string,
	options: Readonly<Record<string, string | number | boolean | undefined>>,
	filePurpose: FilePurpose.ROUTE_PAGE,
): DataCommand => {
	const { tsmorph } = api.getDependencies();

	const rewriteWithTsMorph = (
		input: string,
		legacyPageData: string,
	): string => {
		const project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		const oldPath =
			typeof options.oldPath === "string" ? options.oldPath : null;

		const sourceFile = project.createSourceFile(path ?? "", input);

		const legacyPageSourceFile = project.createSourceFile(
			oldPath ?? "",
			legacyPageData,
		);

		// inserting route segment config to the future page
		const routeSegmentConfig = getRouteSegmentConfig(legacyPageSourceFile);

		sourceFile.addStatements(routeSegmentConfig);

		// inserting server side data hooks along with its dependencies to the future page
		const serverSideDataHooks =
			getServerSideDataHookWithDeps(legacyPageSourceFile);

		const positionAfterImports = getPositionAfterImports(sourceFile);

		sourceFile.insertStatements(positionAfterImports, serverSideDataHooks);

		sourceFile.getFunctions().forEach((fn) => {
			if (fn.isDefaultExport()) {
				fn.remove();
				return;
			}

			const id = fn.getName() ?? "";

			if (
				["getStaticProps", "getServerSideProps", "getStaticPaths"].includes(id)
			) {
				fn.setIsExported(false);
			}
		});

		sourceFile.getVariableStatements().forEach((statement) => {
			statement.getDeclarations().forEach((declaration) => {
				const id = declaration.getName() ?? "";

				if (
					["getStaticProps", "getServerSideProps", "getStaticPaths"].includes(
						id,
					) &&
					declaration.hasExportKeyword()
				) {
					statement.setIsExported(false);
				}
			});
		});

		sourceFile
			.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
			.filter(
				(jsxOpeningElement) =>
					jsxOpeningElement.getTagNameNode().getText() === "Head",
			)
			.map((declaration) => {
				return declaration.getFirstAncestorByKind(SyntaxKind.JsxElement);
			})
			.forEach((jsxElement) => {
				const parenthesizedExpressionParent =
					jsxElement?.getParentIfKind(SyntaxKind.ParenthesizedExpression) ??
					null;

				if (parenthesizedExpressionParent !== null) {
					parenthesizedExpressionParent.replaceWithText("null");

					return;
				}

				jsxElement?.replaceWithText("");
			});

		if (filePurpose === FilePurpose.ROUTE_PAGE) {
			sourceFile.getImportDeclarations().forEach((declaration) => {
				const moduleSpecifier = declaration.getModuleSpecifierValue();

				if (moduleSpecifier.startsWith("./")) {
					declaration.setModuleSpecifier(`.${moduleSpecifier}`);
				} else if (moduleSpecifier.startsWith("../")) {
					declaration.setModuleSpecifier(`../${moduleSpecifier}`);
				}
			});
		}

		return sourceFile.getFullText();
	};

	return {
		kind: "upsertData",
		path,
		data: rewriteWithTsMorph(
			String(options.oldData ?? ""),
			String(options.legacyPageData ?? ""),
		),
	};
};

const SERVER_SIDE_DATA_HOOKS_NAMES = ["getStaticProps", "getServerSideProps"];

const usesServerSideData = (sourceFile: SourceFile) => {
	return (
		sourceFile
			.getFunctions()
			.some((fn) =>
				SERVER_SIDE_DATA_HOOKS_NAMES.includes(fn.getName() ?? ""),
			) ||
		sourceFile
			.getVariableStatements()
			.some((statement) =>
				statement
					.getDeclarations()
					.some((declaration) =>
						SERVER_SIDE_DATA_HOOKS_NAMES.includes(declaration.getName() ?? ""),
					),
			)
	);
};

const usesLayout = (sourceFile: SourceFile) => {
	return sourceFile
		.getImportDeclarations()
		.some(
			(importDeclaration) =>
				importDeclaration.getNamedImports()[0]?.getName() === "getLayout",
		);
};

const getPageContent = (
	newPagePath: string,
	usesLayout: boolean,
	nestedPathWithoutExtension: string,
) => {
	if (newPagePath.endsWith("embed")) {
		return `
import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getData } from "../page";

type PageProps = Readonly<{
	params: Params;
}>;

const Page = ({ params }: PageProps) => {
	await getData(params, true);

	return null;
};
	
export default Page;`;
	}
	if (newPagePath.includes("(individual-page-wrapper")) {
		return `
import OldPage from "@pages/${nestedPathWithoutExtension}";
import { _generateMetadata } from "app/_utils";
import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import PageWrapper from "@components/PageWrapperAppDir";
import { headers, cookies } from "next/headers";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";

${
	usesLayout
		? 'import { getLayout } from "@calcom/features/MainLayoutAppDir";'
		: ""
}

export const generateMetadata = async () => await _generateMetadata(() => "", () => "");

type PageProps = Readonly<{
	params: Params;
}>;

const Page = async ({ params }: PageProps) => {
	const h = headers();
	const nonce = h.get("x-nonce") ?? undefined;
	
	const legacyCtx = buildLegacyCtx(headers(), cookies(), params);
	const props = await getData(legacyCtx);
	
	return (
		<PageWrapper ${usesLayout ? "getLayout={getLayout} " : ""} requiresLicense={false} nonce={nonce} themeBasis={null}>
			<OldPage {...props} />
		</PageWrapper>
	);
};
	
export default Page;`;
	}

	return `
import Page from "@pages/${nestedPathWithoutExtension}";
import { _generateMetadata } from "app/_utils";

export const generateMetadata = async () => await _generateMetadata(() => "", () => "");

export default Page;`;
};

const getNewPagePath = (
	directoryNames: string[],
	fileName: string,
	usesServerSideData: boolean,
	usesLayout: boolean,
) => {
	const newDirArr = directoryNames.map((name) => {
		if (name !== "pages") {
			return name;
		}

		if (usesServerSideData) {
			return "app/future/(individual-page-wrapper)";
		}

		if (usesLayout) {
			return "app/future/(shared-page-wrapper)/(layout)";
		}

		return "app/future/(shared-page-wrapper)/(no-layout)";
	});

	if (fileName !== "index") {
		newDirArr.push(fileName);
	}

	return newDirArr.join(sep);
};

const handleFile: Filemod<Dependencies, Record<string, never>>["handleFile"] =
	async (api, path, options) => {
		const parsedPath = parse(path);
		const directoryNames = parsedPath.dir.split(sep);
		const endsWithPages =
			directoryNames.length > 0 &&
			directoryNames.lastIndexOf("pages") === directoryNames.length - 1;

		const nameIsIndex = parsedPath.name === "index";

		if (endsWithPages && nameIsIndex) {
			return [];
		}

		const oldData = await api.readFile(path);

		if (!endsWithPages) {
			const project = new tsmorph.Project({
				useInMemoryFileSystem: true,
				skipFileDependencyResolution: true,
				compilerOptions: {
					allowJs: true,
				},
			});

			const sourceFile = project.createSourceFile(path ?? "", oldData);

			const pageUsesServerSideData = usesServerSideData(sourceFile);
			const pageUsesLayout = usesLayout(sourceFile);

			const newPagePath = getNewPagePath(
				directoryNames,
				parsedPath.name,
				pageUsesServerSideData,
				pageUsesLayout,
			);

			const nestedPathWithoutExtension = `${
				parsedPath.dir.split("/pages/")[1] ?? ""
			}/${parsedPath.name}`;

			const pageContent = getPageContent(
				newPagePath,
				pageUsesLayout,
				nestedPathWithoutExtension,
			);

			const commands: FileCommand[] = [
				{
					kind: "upsertFile",
					path: format({
						root: parsedPath.root,
						dir: newPagePath,
						ext: parsedPath.ext,
						name: "page",
					}),
					options: {
						...options,
						filePurpose: FilePurpose.ROUTE_PAGE,
						oldPath: path,
						oldData: removeLeadingLineBreaks(pageContent),
						legacyPageData: oldData,
					},
				},
				{
					kind: "upsertFile",
					path: format({
						root: parsedPath.root,
						dir: parsedPath.dir,
						ext: parsedPath.ext,
						name: parsedPath.name,
					}),
					options: {
						...options,
						filePurpose: FilePurpose.ORIGINAL_PAGE,
						oldPath: path,
						oldData,
					},
				},
			];

			return commands;
		}

		if (parsedPath.name === "_app" || parsedPath.name === "_document") {
			return [
				{
					kind: "deleteFile",
					path,
				},
			];
		}

		return [];
	};

const handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	__,
	options,
) => {
	try {
		const filePurpose = (options.filePurpose ?? null) as FilePurpose | null;

		if (filePurpose === null) {
			return {
				kind: "noop",
			};
		}

		const content = map.get(filePurpose) ?? null;

		if (content === null) {
			return {
				kind: "noop",
			};
		}

		if (filePurpose === FilePurpose.ROUTE_PAGE && options.oldPath) {
			return buildPageFileData(api, path, options, filePurpose);
		}

		if (
			filePurpose === FilePurpose.ORIGINAL_PAGE &&
			options.oldPath &&
			options.oldData
		) {
			return addUseClientStatement(
				String(options.oldPath),
				String(options.oldData),
			);
		}

		return {
			kind: "upsertData",
			path,
			data: content,
		};
	} catch (error) {
		return {
			kind: "noop",
		};
	}
};

export const repomod: Filemod<Dependencies, State> = {
	includePatterns: ["**/pages/**/*.{js,jsx,ts,tsx}"],
	excludePatterns: ["**/node_modules/**", "**/pages/api/**"],
	handleFile,
	handleData,
};
