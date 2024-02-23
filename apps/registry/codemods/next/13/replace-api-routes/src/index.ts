import { format, parse, sep } from "node:path";
import type { ParsedPath } from "path";
import type { Filemod, UnifiedFileSystem } from "@codemod-com/filemod";
import type {
	ArrowFunction,
	Block,
	CallExpression,
	FunctionDeclaration,
	FunctionExpression,
	SourceFile,
} from "ts-morph";
import tsmorph, { Node, SyntaxKind } from "ts-morph";

// eslint-disable-next-line @typescript-eslint/ban-types
type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
	unifiedFileSystem: UnifiedFileSystem;
}>;

type Handler = ArrowFunction | FunctionExpression | FunctionDeclaration;

const getNewDirectoryName = ({ dir, name }: ParsedPath) => {
	const directoryNameSegments = dir.split(sep);

	const newDirectoryNameSegments = directoryNameSegments.map((segment) =>
		segment === "pages" ? "app" : segment,
	);

	if (name !== "index") {
		newDirectoryNameSegments.push(name);
	}

	return newDirectoryNameSegments.join(sep);
};

const findAPIRouteHandler = (sourceFile: SourceFile): Handler | null => {
	const defaultExportedFunctionDeclaration = sourceFile
		.getFunctions()
		.find((f) => f.isDefaultExport());

	if (defaultExportedFunctionDeclaration !== undefined) {
		return defaultExportedFunctionDeclaration;
	}

	const exportAssignment = sourceFile
		.getStatements()
		.find((s) => Node.isExportAssignment(s));

	const declarations =
		exportAssignment
			?.getFirstDescendantByKind(SyntaxKind.Identifier)
			?.getSymbol()
			?.getDeclarations() ?? [];

	let handler: Handler | null = null;

	declarations.forEach((d) => {
		if (Node.isVariableDeclaration(d)) {
			const initializer = d?.getInitializer();

			if (
				Node.isArrowFunction(initializer) ||
				Node.isFunctionExpression(initializer)
			) {
				handler = initializer;
				return;
			}
		}

		if (Node.isFunctionDeclaration(d)) {
			handler = d;
		}
	});

	return handler ?? null;
};

const getPositionAfterImports = (sourceFile: SourceFile): number => {
	const lastImportDeclaration =
		sourceFile.getLastChildByKind(SyntaxKind.ImportDeclaration) ?? null;

	return (lastImportDeclaration?.getChildIndex() ?? 0) + 1;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

export type HTTPMethod = (typeof HTTP_METHODS)[number];

const RESPONSE_INIT_FIELDS = ["headers", "status", "statusText"] as const;

const OLD_RESPONSE_METHODS = ["json", "send", "end"];

type ResponseInitParam = (typeof RESPONSE_INIT_FIELDS)[number];
type ResponseInit = Partial<{ [k in ResponseInitParam]: unknown }>;

// res.status() => status
const getCallExpressionName = (callExpression: CallExpression) => {
	const expression = callExpression.getExpression();

	if (!Node.isPropertyAccessExpression(expression)) {
		return null;
	}

	return expression.getName();
};

const getResponseInit = (block: Block): ResponseInit => {
	const responseInit: ResponseInit = {};

	const blockExpressionStatements = block.getChildrenOfKind(
		SyntaxKind.ExpressionStatement,
	);

	blockExpressionStatements.forEach((blockExpressionStatement) => {
		const expression = blockExpressionStatement.getExpression();

		if (Node.isCallExpression(expression)) {
			const nestedCallExpressions = expression.getDescendantsOfKind(
				SyntaxKind.CallExpression,
			);

			nestedCallExpressions.forEach((nestedCallExpression) => {
				const callExpressionExpr = nestedCallExpression.getExpression();

				if (
					Node.isPropertyAccessExpression(callExpressionExpr) &&
					callExpressionExpr.getName() === "status"
				) {
					responseInit[callExpressionExpr.getName() as ResponseInitParam] =
						nestedCallExpression.getArguments()[0]?.getText() ?? "";
				}
			});
		}

		if (Node.isBinaryExpression(expression)) {
			const left = expression.getLeft();

			const right = expression.getRight();

			if (
				Node.isPropertyAccessExpression(left) &&
				Node.isIdentifier(left.getNameNode()) &&
				left.getNameNode().getText() === "statusCode"
			) {
				responseInit.status = Node.isStringLiteral(right)
					? right.getLiteralText()
					: right.getText();
			}
		}
	});

	const upperBlock = block.getFirstAncestorByKind(SyntaxKind.Block);

	if (upperBlock !== undefined) {
		const responseInitFromUpperScope = getResponseInit(upperBlock);
		return { ...responseInitFromUpperScope, ...responseInit };
	}

	return responseInit;
};

const getNewResponseText = (
	type: string,
	bodyInit: string,
	responseInit: ResponseInit,
) => {
	if (type === "json") {
		return `return NextResponse.json(${bodyInit}, ${JSON.stringify(
			responseInit,
		)})`;
	}

	if (type === "send") {
		return `return new NextResponse(${bodyInit}, ${JSON.stringify(
			responseInit,
		)})`;
	}

	if (type === "end") {
		return `return new NextResponse(undefined, ${JSON.stringify(
			responseInit,
		)})`;
	}

	return "";
};

const removeResReferences = (handler: Handler) => {
	const [, res] = handler.getParameters();

	const resReferences = res?.findReferencesAsNodes() ?? [];

	resReferences.forEach((resReference) => {
		const statement = resReference.getFirstAncestorByKind(
			SyntaxKind.ExpressionStatement,
		);
		statement?.remove();
	});
};

const rewriteResponseCallExpressions = (handler: Handler) => {
	const callExpressionResponseInitMap = new Map<CallExpression, ResponseInit>();

	handler
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.filter((callExpression) =>
			OLD_RESPONSE_METHODS.includes(
				getCallExpressionName(callExpression) ?? "",
			),
		)
		.forEach((callExpression) => {
			const block = callExpression.getFirstAncestorByKind(SyntaxKind.Block);

			if (block === undefined) {
				return;
			}

			const responseInit = getResponseInit(block);
			callExpressionResponseInitMap.set(callExpression, responseInit);
		});

	Array.from(callExpressionResponseInitMap).forEach(
		([callExpression, responseInit]) => {
			const bodyInit = callExpression.getArguments()[0]?.getText() ?? "";

			const newResponseText = getNewResponseText(
				getCallExpressionName(callExpression) ?? "",
				bodyInit,
				responseInit,
			);

			const expressionStatement = callExpression.getParent();
			expressionStatement?.replaceWithText(newResponseText);
		},
	);

	removeResReferences(handler);
};

const rewriteReqResImports = (sourceFile: SourceFile) => {
	const importDeclaration = sourceFile
		.getImportDeclarations()
		.find((d) => d.getModuleSpecifier().getLiteralText() === "next");
	importDeclaration?.remove();

	sourceFile.insertStatements(
		0,
		`import { type NextRequest, NextResponse } from 'next/server';`,
	);
};

const rewriteParams = (handler: Handler) => {
	const params = handler.getParameters();

	params[0]?.setType("NextRequest");
	params[1]?.remove();
};

const rewriteAPIRoute = (sourceFile: SourceFile) => {
	const HTTPMethodHandlers = new Map<HTTPMethod, string>();

	const handler = findAPIRouteHandler(sourceFile);

	if (handler === null) {
		return;
	}

	const handlerBody = handler.getBody() ?? null;

	if (handlerBody === null) {
		return;
	}

	handlerBody.getDescendants().forEach((node) => {
		if (Node.isIfStatement(node)) {
			const condition = node.getExpression();
			if (
				Node.isBinaryExpression(condition) &&
				condition.getLeft().getText() === "req.method"
			) {
				const rightNodeText = condition.getRight().getText();

				const rightNodeTextWithoutQuotes = rightNodeText.substring(
					1,
					rightNodeText.length - 1,
				) as HTTPMethod;

				if (HTTP_METHODS.includes(rightNodeTextWithoutQuotes)) {
					HTTPMethodHandlers.set(
						rightNodeTextWithoutQuotes,
						node.getThenStatement().getText(),
					);
				}
			}
		}
	});

	const positionAfterImports = getPositionAfterImports(sourceFile);

	Array.from(HTTPMethodHandlers).forEach(([method, methodHandler]) => {
		const [statement] = sourceFile.insertStatements(
			positionAfterImports,
			`export async function ${method}(${handler
				.getParameters()
				.map((p) => p.getText())
				.join(",")}) 
			 ${methodHandler}
			`,
		);

		if (statement === undefined) {
			return;
		}

		rewriteResponseCallExpressions(statement as Handler);
		rewriteParams(statement as Handler);
	});

	const pos = Node.isFunctionDeclaration(handler)
		? handler.getChildIndex()
		: handler
				.getFirstAncestorByKind(SyntaxKind.VariableStatement)
				?.getChildIndex();

	if (pos !== undefined) {
		sourceFile.removeStatement(pos);
	}

	const defaultExport = sourceFile.getDescendantsOfKind(
		SyntaxKind.ExportAssignment,
	)[0];

	if (defaultExport) {
		sourceFile.removeStatement(defaultExport.getChildIndex());
	}

	rewriteReqResImports(sourceFile);
};

export const repomod: Filemod<Dependencies, Record<string, unknown>> = {
	includePatterns: ["**/pages/api/**/*.{js,ts,cjs,ejs}"],
	excludePatterns: ["**/node_modules/**"],
	handleFile: async (api, path) => {
		const parsedPath = parse(path);

		const oldData = await api.readFile(path);

		return [
			{
				kind: "upsertFile",
				path: format({
					root: parsedPath.root,
					dir: getNewDirectoryName(parsedPath),
					ext: ".ts",
					name: "route",
				}),
				options: {
					oldPath: path,
					oldData,
				},
			},
		];
	},
	handleData: async (api, path, data, options) => {
		const project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		const sourceFile = project.createSourceFile(
			String(options.oldPath ?? ""),
			String(options.oldData),
		);

		rewriteAPIRoute(sourceFile);

		return {
			kind: "upsertData",
			path,
			data: sourceFile.getFullText(),
		};
	},
};
