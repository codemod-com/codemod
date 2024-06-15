import type { ParameterDeclaration } from 'ts-morph';
import {
	type ArrowFunction,
	type Block,
	type CallExpression,
	type FunctionExpression,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph';

function getImportDeclarationAlias(
	sourceFile: SourceFile,
	moduleSpecifier: string,
	name: string,
) {
	let importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier);
	if (!importDeclaration) {
		return null;
	}

	let namedImport = importDeclaration
		.getNamedImports()
		.find((specifier) => specifier.getName() === name);

	if (!namedImport) {
		return null;
	}

	return namedImport.getAliasNode()?.getText() ?? namedImport.getName();
}

function isMSWCall(sourceFile: SourceFile, callExpr: CallExpression) {
	let httpCallerName = getImportDeclarationAlias(sourceFile, 'msw', 'http');
	let graphqlCallerName = getImportDeclarationAlias(
		sourceFile,
		'msw',
		'graphql',
	);

	let identifiers =
		callExpr
			.getChildrenOfKind(SyntaxKind.PropertyAccessExpression)
			.at(0)
			?.getChildrenOfKind(SyntaxKind.Identifier) ?? [];

	let caller = identifiers.at(0);

	if (!caller) {
		return false;
	}

	let method = identifiers.at(1) ?? caller;

	let methodText = method.getText();

	let isHttpCall =
		caller.getText() === httpCallerName &&
		// This is what would be cool to get through inferring the type via
		// typeChecker/langServer/diagnostics etc, for example
		[
			'all',
			'get',
			'post',
			'put',
			'patch',
			'delete',
			'head',
			'options',
		].includes(methodText);

	let isGraphQLCall =
		caller.getText() === graphqlCallerName &&
		['query', 'mutation'].includes(methodText);

	return isHttpCall || isGraphQLCall;
}

function getCallbackData(
	expression: CallExpression,
):
	| [
			Block | FunctionExpression | ArrowFunction,
			ReadonlyArray<ParameterDeclaration>,
			FunctionExpression | ArrowFunction,
	  ]
	| null {
	let mockCallback = expression.getArguments().at(1) ?? null;

	if (mockCallback === null) {
		return null;
	}

	let cbParams = mockCallback.getChildrenOfKind(SyntaxKind.Parameter);

	let syntaxCb =
		mockCallback.asKind(SyntaxKind.ArrowFunction) ??
		mockCallback.asKind(SyntaxKind.FunctionExpression) ??
		null;

	if (syntaxCb === null) {
		return null;
	}

	let callbackBody =
		mockCallback.getChildrenOfKind(SyntaxKind.Block).at(0) ?? syntaxCb;

	return [callbackBody, cbParams, syntaxCb];
}

function shouldProcessFile(sourceFile: SourceFile): boolean {
	return (
		sourceFile
			.getImportDeclarations()
			.find((decl) =>
				decl.getModuleSpecifier().getLiteralText().startsWith('msw'),
			) !== undefined
	);
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#request-changes
export function handleSourceFile(sourceFile: SourceFile): string | undefined {
	if (!shouldProcessFile(sourceFile)) {
		return undefined;
	}

	sourceFile
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.filter((callExpr) => isMSWCall(sourceFile, callExpr))
		.forEach((expression) => {
			let callbackData = getCallbackData(expression);
			if (callbackData === null) {
				return;
			}
			let [callbackBody, callParams, syntaxCb] = callbackData;
			let [reqParam] = callParams;

			let references = reqParam?.findReferencesAsNodes() ?? [];
			references.forEach((ref) => {
				ref.replaceWithText('request');
			});

			let paramList =
				syntaxCb.getLastChildByKind(SyntaxKind.SyntaxList) ?? null;
			let isParenthesized =
				syntaxCb.getChildrenOfKind(SyntaxKind.OpenParenToken).length >
				0;
			if (paramList === null) {
				return;
			}

			let possibleParams = ['request', 'params', 'cookies'];
			let foundDeclarations: string[] = [];
			// In order to prevent duplicate identifier error, since it won't get replaced
			// by fixUnusedIdentifiers call.
			callbackBody
				.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
				.forEach((vd) =>
					possibleParams.forEach((param) => {
						let found =
							vd
								.getFirstChildIfKind(SyntaxKind.Identifier)
								?.getText() === param;
						if (found) {
							foundDeclarations.push(param);
						}
					}),
				);

			let toAddFinal = possibleParams.filter(
				(p) => !foundDeclarations.includes(p),
			);
			// paramsToAdd
			let toReplaceWith = `{ ${toAddFinal.join(', ')} }`;
			paramList.replaceWithText(
				isParenthesized ? toReplaceWith : `(${toReplaceWith})`,
			);
		});

	sourceFile.fixUnusedIdentifiers();

	return sourceFile.getFullText();
}
