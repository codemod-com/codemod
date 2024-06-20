import type { ParameterDeclaration } from 'ts-morph';
import {
	type ArrowFunction,
	type BindingElement,
	type Block,
	type CallExpression,
	type FunctionExpression,
	type SourceFile,
	SyntaxKind,
	VariableDeclarationKind,
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

	return namedImport.getAliasNode()?.getText() || namedImport.getName();
}

function searchIdentifiers(
	codeBlock: Block | FunctionExpression | ArrowFunction,
	searchables: string[],
) {
	let matchedStrings = [
		...codeBlock.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression),
		...codeBlock.getDescendantsOfKind(SyntaxKind.BindingElement),
	].flatMap((parent) => {
		let identifiers = parent.getDescendantsOfKind(SyntaxKind.Identifier);

		return searchables.filter((tested) =>
			identifiers.some((id) => id.getText() === tested),
		);
	});

	return new Set(matchedStrings);
}

function replaceDestructureAliases(
	bindingEl: BindingElement,
	newName?: string,
) {
	let directIds = bindingEl.getChildrenOfKind(SyntaxKind.Identifier);

	let [nameNode, aliasNode] = directIds;

	if (!nameNode || !aliasNode) {
		return;
	}

	if (directIds.length === 2) {
		aliasNode
			.findReferencesAsNodes()
			.forEach((ref) =>
				ref.replaceWithText(newName ?? nameNode.getText()),
			);
	}
}

function replaceReferences(
	codeBlock: SourceFile | Block | FunctionExpression | ArrowFunction,
	replaced: string[],
	callerName: string | undefined,
	newName?: string,
) {
	let didReplace = false;

	codeBlock
		.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
		.forEach((accessExpr) => {
			if (
				replaced.includes(accessExpr.getName()) &&
				accessExpr
					.getChildrenOfKind(SyntaxKind.Identifier)[0]
					?.getText() === callerName
			) {
				let accessed = accessExpr
					.getChildrenOfKind(SyntaxKind.Identifier)
					.at(-1)
					?.getText();
				if (!accessed) {
					throw new Error('Could not find accessed identifier');
				}

				didReplace = true;
				accessExpr.replaceWithText(newName ?? accessed);
			}
		});

	codeBlock
		.getDescendantsOfKind(SyntaxKind.ObjectBindingPattern)
		.forEach((bindingPattern) => {
			let toReplaceFromBinding: string[] = [];

			bindingPattern
				.getDescendantsOfKind(SyntaxKind.BindingElement)
				.forEach((bindingEl) => {
					let destructuredReplaced = bindingEl
						.getDescendantsOfKind(SyntaxKind.Identifier)
						.find((d) => replaced.includes(d.getText()));
					if (destructuredReplaced) {
						replaceDestructureAliases(bindingEl, newName);

						toReplaceFromBinding.push(bindingEl.getText());
					}
				});

			if (toReplaceFromBinding.length) {
				didReplace = true;

				bindingPattern?.replaceWithText(
					bindingPattern
						.getText()
						.replace(
							new RegExp(
								`(,\\s*)?(${toReplaceFromBinding.join('|')})+(\\s*,)?`,
								'g',
							),
							(fullMatch, p1, _p2, p3) => {
								if (fullMatch && ![p1, p3].includes(fullMatch))
									return '';
								return fullMatch;
							},
						),
				);

				if (
					!bindingPattern.getDescendantsOfKind(SyntaxKind.Identifier)
						.length
				) {
					bindingPattern
						.getAncestors()
						.find(
							(a) =>
								a.getKind() === SyntaxKind.VariableDeclaration,
						)
						?.asKindOrThrow(SyntaxKind.VariableDeclaration)
						.remove();
				} else {
					bindingPattern.formatText();
				}
			}
		});

	return didReplace;
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

			let [callbackBody, callbackParams, syntaxCb] = callbackData;
			let [reqParam] = callbackParams;

			let signatureMatches = searchIdentifiers(callbackBody, [
				'cookies',
				'params',
			]);

			if (signatureMatches.size) {
				replaceReferences(
					callbackBody,
					Array.from(signatureMatches),
					reqParam?.getText(),
				);
			}

			let reqCallMatches = searchIdentifiers(callbackBody, [
				'searchParams',
				'url',
			]);

			if (reqCallMatches.size) {
				replaceReferences(callbackBody, ['url'], reqParam?.getText());

				// call searchParams on newly created url object
				let varStatement = callbackBody.insertVariableStatement(0, {
					declarations: [
						{
							name: 'url',
							initializer: 'new URL(request.url)',
						},
					],
				});

				varStatement.setDeclarationKind(VariableDeclarationKind.Const);
				varStatement.formatText();

				callbackBody
					.getDescendantsOfKind(SyntaxKind.Identifier)
					.forEach((id) => {
						if (
							id.getText() === 'searchParams' &&
							id
								.getParentIfKind(
									SyntaxKind.PropertyAccessExpression,
								)
								?.getFirstChild()
								?.getText() === 'searchParams'
						) {
							id.replaceWithText('url.searchParams');
						}
					});
			}

			// https://mswjs.io/docs/migrations/1.x-to-2.x/#request-body
			let isVariableNameTaken =
				callbackBody
					.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
					.find(
						(vd) =>
							vd
								.getFirstChildIfKind(SyntaxKind.Identifier)
								?.getText() === 'body',
					) ?? false;

			let replacementOccurred = replaceReferences(
				callbackBody,
				['body'],
				reqParam?.getText(),
				isVariableNameTaken ? 'reqBody' : undefined,
			);
			if (replacementOccurred) {
				callbackBody.insertVariableStatement(0, {
					declarations: [
						{
							name: isVariableNameTaken ? 'reqBody' : 'body',
							initializer: 'await request.json()',
						},
					],
					declarationKind: VariableDeclarationKind.Const,
				});

				if (!syntaxCb.isAsync()) {
					syntaxCb.setIsAsync(true);
				}
			}
		});

	return sourceFile.getFullText();
}
