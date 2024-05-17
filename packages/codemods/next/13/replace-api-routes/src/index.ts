import { format, parse, sep } from 'node:path';
import type { ParsedPath } from 'node:path';
import type { Filemod, UnifiedFileSystem } from '@codemod-com/filemod';
import type {
	ArrowFunction,
	Block,
	CallExpression,
	FunctionDeclaration,
	FunctionExpression,
	SourceFile,
} from 'ts-morph';
import tsmorph, { Node, SyntaxKind } from 'ts-morph';

type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
	unifiedFileSystem: UnifiedFileSystem;
}>;

type Handler = ArrowFunction | FunctionExpression | FunctionDeclaration;

let getNewDirectoryName = ({ dir, name }: ParsedPath) => {
	let directoryNameSegments = dir.split(sep);

	let newDirectoryNameSegments = directoryNameSegments.map((segment) =>
		segment === 'pages' ? 'app' : segment,
	);

	if (name !== 'index') {
		newDirectoryNameSegments.push(name);
	}

	return newDirectoryNameSegments.join(sep);
};

let findAPIRouteHandler = (sourceFile: SourceFile): Handler | null => {
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

	let handler: Handler | null = null;

	declarations.forEach((d) => {
		if (Node.isVariableDeclaration(d)) {
			let initializer = d?.getInitializer();

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

let getPositionAfterImports = (sourceFile: SourceFile): number => {
	let lastImportDeclaration =
		sourceFile.getLastChildByKind(SyntaxKind.ImportDeclaration) ?? null;

	return (lastImportDeclaration?.getChildIndex() ?? 0) + 1;
};

let HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

export type HTTPMethod = (typeof HTTP_METHODS)[number];

let RESPONSE_INIT_FIELDS = ['headers', 'status', 'statusText'] as const;

let OLD_RESPONSE_METHODS = ['json', 'send', 'end'];

type ResponseInitParam = (typeof RESPONSE_INIT_FIELDS)[number];
type ResponseInit = Partial<{ [k in ResponseInitParam]: unknown }>;

// res.status() => status
let getCallExpressionName = (callExpression: CallExpression) => {
	let expression = callExpression.getExpression();

	if (!Node.isPropertyAccessExpression(expression)) {
		return null;
	}

	return expression.getName();
};

let getResponseInit = (block: Block): ResponseInit => {
	let responseInit: ResponseInit = {};

	let blockExpressionStatements = block.getChildrenOfKind(
		SyntaxKind.ExpressionStatement,
	);

	blockExpressionStatements.forEach((blockExpressionStatement) => {
		let expression = blockExpressionStatement.getExpression();

		if (Node.isCallExpression(expression)) {
			let nestedCallExpressions = expression.getDescendantsOfKind(
				SyntaxKind.CallExpression,
			);

			nestedCallExpressions.forEach((nestedCallExpression) => {
				let callExpressionExpr = nestedCallExpression.getExpression();

				if (
					Node.isPropertyAccessExpression(callExpressionExpr) &&
					callExpressionExpr.getName() === 'status'
				) {
					responseInit[
						callExpressionExpr.getName() as ResponseInitParam
					] = nestedCallExpression.getArguments()[0]?.getText() ?? '';
				}
			});
		}

		if (Node.isBinaryExpression(expression)) {
			let left = expression.getLeft();

			let right = expression.getRight();

			if (
				Node.isPropertyAccessExpression(left) &&
				Node.isIdentifier(left.getNameNode()) &&
				left.getNameNode().getText() === 'statusCode'
			) {
				responseInit.status = Node.isStringLiteral(right)
					? right.getLiteralText()
					: right.getText();
			}
		}
	});

	let upperBlock = block.getFirstAncestorByKind(SyntaxKind.Block);

	if (upperBlock !== undefined) {
		let responseInitFromUpperScope = getResponseInit(upperBlock);
		return { ...responseInitFromUpperScope, ...responseInit };
	}

	return responseInit;
};

let getNewResponseText = (
	type: string,
	bodyInit: string,
	responseInit: ResponseInit,
) => {
	if (type === 'json') {
		return `return NextResponse.json(${bodyInit}, ${JSON.stringify(
			responseInit,
		)})`;
	}

	if (type === 'send') {
		return `return new NextResponse(${bodyInit}, ${JSON.stringify(
			responseInit,
		)})`;
	}

	if (type === 'end') {
		return `return new NextResponse(undefined, ${JSON.stringify(
			responseInit,
		)})`;
	}

	return '';
};

let removeResReferences = (handler: Handler) => {
	let [, res] = handler.getParameters();

	let resReferences = res?.findReferencesAsNodes() ?? [];

	resReferences.forEach((resReference) => {
		let statement = resReference.getFirstAncestorByKind(
			SyntaxKind.ExpressionStatement,
		);
		statement?.remove();
	});
};

let rewriteResponseCallExpressions = (handler: Handler) => {
	let callExpressionResponseInitMap = new Map<CallExpression, ResponseInit>();

	handler
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.filter((callExpression) =>
			OLD_RESPONSE_METHODS.includes(
				getCallExpressionName(callExpression) ?? '',
			),
		)
		.forEach((callExpression) => {
			let block = callExpression.getFirstAncestorByKind(SyntaxKind.Block);

			if (block === undefined) {
				return;
			}

			let responseInit = getResponseInit(block);
			callExpressionResponseInitMap.set(callExpression, responseInit);
		});

	Array.from(callExpressionResponseInitMap).forEach(
		([callExpression, responseInit]) => {
			let bodyInit = callExpression.getArguments()[0]?.getText() ?? '';

			let newResponseText = getNewResponseText(
				getCallExpressionName(callExpression) ?? '',
				bodyInit,
				responseInit,
			);

			let expressionStatement = callExpression.getParent();
			expressionStatement?.replaceWithText(newResponseText);
		},
	);

	removeResReferences(handler);
};

let rewriteReqResImports = (sourceFile: SourceFile) => {
	let importDeclaration = sourceFile
		.getImportDeclarations()
		.find((d) => d.getModuleSpecifier().getLiteralText() === 'next');
	importDeclaration?.remove();

	sourceFile.insertStatements(
		0,
		`import { type NextRequest, NextResponse } from 'next/server';`,
	);
};

let rewriteParams = (handler: Handler) => {
	let params = handler.getParameters();

	params[0]?.setType('NextRequest');
	params[1]?.remove();
};

let rewriteAPIRoute = (sourceFile: SourceFile) => {
	let HTTPMethodHandlers = new Map<HTTPMethod, string>();

	let handler = findAPIRouteHandler(sourceFile);

	if (handler === null) {
		return;
	}

	let handlerBody = handler.getBody() ?? null;

	if (handlerBody === null) {
		return;
	}

	handlerBody.getDescendants().forEach((node) => {
		if (Node.isIfStatement(node)) {
			let condition = node.getExpression();
			if (
				Node.isBinaryExpression(condition) &&
				condition.getLeft().getText() === 'req.method'
			) {
				let rightNodeText = condition.getRight().getText();

				let rightNodeTextWithoutQuotes = rightNodeText.substring(
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

	let positionAfterImports = getPositionAfterImports(sourceFile);

	Array.from(HTTPMethodHandlers).forEach(([method, methodHandler]) => {
		let [statement] = sourceFile.insertStatements(
			positionAfterImports,
			`export async function ${method}(${handler
				.getParameters()
				.map((p) => p.getText())
				.join(',')}) 
			 ${methodHandler}
			`,
		);

		if (statement === undefined) {
			return;
		}

		rewriteResponseCallExpressions(statement as Handler);
		rewriteParams(statement as Handler);
	});

	let pos = Node.isFunctionDeclaration(handler)
		? handler.getChildIndex()
		: handler
				.getFirstAncestorByKind(SyntaxKind.VariableStatement)
				?.getChildIndex();

	if (pos !== undefined) {
		sourceFile.removeStatement(pos);
	}

	let defaultExport = sourceFile.getDescendantsOfKind(
		SyntaxKind.ExportAssignment,
	)[0];

	if (defaultExport) {
		sourceFile.removeStatement(defaultExport.getChildIndex());
	}

	rewriteReqResImports(sourceFile);
};

export let repomod: Filemod<Dependencies, Record<string, unknown>> = {
	includePatterns: ['**/pages/api/**/*.{js,ts,cjs,ejs}'],
	excludePatterns: ['**/node_modules/**'],
	handleFile: async (api, path) => {
		let parsedPath = parse(path);

		let oldData = await api.readFile(path);

		return [
			{
				kind: 'upsertFile',
				path: format({
					root: parsedPath.root,
					dir: getNewDirectoryName(parsedPath),
					ext: '.ts',
					name: 'route',
				}),
				options: {
					oldPath: path,
					oldData,
				},
			},
		];
	},
	handleData: async (api, path, data, options) => {
		let project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		let sourceFile = project.createSourceFile(
			String(options.oldPath ?? ''),
			String(options.oldData),
		);

		rewriteAPIRoute(sourceFile);

		return {
			kind: 'upsertData',
			path,
			data: sourceFile.getFullText(),
		};
	},
};
