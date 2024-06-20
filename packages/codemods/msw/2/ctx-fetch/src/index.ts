import type { ParameterDeclaration, SourceFile } from 'ts-morph';
import {
	type ArrowFunction,
	type BindingElement,
	type Block,
	type CallExpression,
	type FunctionExpression,
	type ImportSpecifier,
	SyntaxKind,
} from 'ts-morph';

function addNamedImportDeclaration(
	sourceFile: SourceFile,
	moduleSpecifier: string,
	name: string,
): ImportSpecifier {
	let importDeclaration =
		sourceFile.getImportDeclaration(moduleSpecifier) ??
		sourceFile.addImportDeclaration({ moduleSpecifier });

	let existing = importDeclaration
		.getNamedImports()
		.find((specifier) => specifier.getName() === name);

	return existing ?? importDeclaration.addNamedImport({ name });
}

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
	codeBlock: Block | ArrowFunction | FunctionExpression,
	searchables: ReadonlyArray<string>,
): ReadonlySet<string> {
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

export function replaceDestructureAliases(bindingEl: BindingElement) {
	let directIds = bindingEl.getChildrenOfKind(SyntaxKind.Identifier);

	let [nameNode, aliasNode] = directIds;

	if (!nameNode || !aliasNode) {
		return;
	}

	if (directIds.length === 2) {
		aliasNode
			.findReferencesAsNodes()
			.forEach((ref) => ref.replaceWithText(nameNode.getText()));
	}
}

export function replaceReferences(
	codeBlock: SourceFile | Block | ArrowFunction | FunctionExpression,
	replaced: string[],
	callerName: string | undefined,
) {
	let didReplace = false;

	codeBlock
		.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
		.forEach((accessExpr) => {
			let accessIds = accessExpr.getChildrenOfKind(SyntaxKind.Identifier);

			let accessOwnerName = accessIds.at(0)?.getText();
			let accessedPropertyName = accessIds.at(-1)?.getText();

			if (
				replaced.includes(accessExpr.getName()) &&
				accessOwnerName === callerName
			) {
				if (!accessedPropertyName) {
					throw new Error('Could not find accessed identifier');
				}

				didReplace = true;
				accessExpr.replaceWithText(accessedPropertyName);
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
						replaceDestructureAliases(bindingEl);

						toReplaceFromBinding.push(bindingEl.getText());
					}
				});

			if (toReplaceFromBinding.length) {
				didReplace = true;

				let toReplaceRegex = toReplaceFromBinding.join('|');
				bindingPattern?.replaceWithText(
					bindingPattern
						.getText()
						.replace(
							new RegExp(
								`(,\\s*)?(${toReplaceRegex})+(\\s*,)?`,
								'g',
							),
							(fullMatch, p1, _p2, p3) => {
								if (![p1, p3].includes(fullMatch)) {
									return '';
								}

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

function shouldProcessFile(sourceFile: SourceFile): boolean {
	return (
		sourceFile
			.getImportDeclarations()
			.find((decl) =>
				decl.getModuleSpecifier().getLiteralText().startsWith('msw'),
			) !== undefined
	);
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#ctxfetch
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

			let [callbackBody, callbackParams] = callbackData;
			let [, , ctxParam] = callbackParams;

			let matchedValues = searchIdentifiers(callbackBody, ['fetch']);

			if (matchedValues.size) {
				addNamedImportDeclaration(sourceFile, 'msw', 'bypass');

				callbackBody
					.getDescendantsOfKind(SyntaxKind.CallExpression)
					.forEach((call) => {
						let [caller, , param] = call.getChildren();

						if (caller?.getText().includes('fetch')) {
							param?.replaceWithText(
								`bypass(${param.getText()})`,
							);
						}
					});

				replaceReferences(
					callbackBody,
					Array.from(matchedValues),
					ctxParam?.getName(),
				);
			}
		});

	return sourceFile.getFullText();
}
