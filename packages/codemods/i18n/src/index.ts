import type { Filemod, UnifiedFileSystem } from '@codemod-com/filemod';
import type {
	CallExpression,
	ImportDeclaration,
	ImportSpecifier,
	JsxOpeningElement,
	JsxSelfClosingElement,
	SourceFile,
	TemplateExpression,
} from 'ts-morph';
import tsmorph, { Node, SyntaxKind } from 'ts-morph';

type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
	unifiedFileSystem: UnifiedFileSystem;
}>;

let isNotSnakeCase = (str: string) => {
	return /^[a-z]+(_[a-z]+)*$/.test(str);
};

let TRANSLATION_FUNCTION_NAMES = [
	't',
	'language',
	'translate',
	'getTextBody',
] as const;
type TranslationFunctionNames = (typeof TRANSLATION_FUNCTION_NAMES)[number];

let isTranslationFunctionName = (
	str: string,
): str is TranslationFunctionNames =>
	TRANSLATION_FUNCTION_NAMES.includes(str as TranslationFunctionNames);

let getValidTemplateHeadText = (
	expression: TemplateExpression,
): string | null => {
	let { text } = expression.getHead().compilerNode;

	return text.length !== 0 ? text : null;
};

let getValidTemplateTailText = (
	expression: TemplateExpression,
): string | null => {
	let spans = expression.getTemplateSpans();

	let lastSpan = spans[spans.length - 1] ?? null;

	if (lastSpan === null) {
		return null;
	}

	let literal = lastSpan.getLiteral();

	if (!Node.isTemplateTail(literal)) {
		return null;
	}

	let { text } = literal.compilerNode;

	return text.length !== 0 ? text : null;
};

let addTemplateHeadTextToKeyHeads = (
	state: State,
	templateExpression: TemplateExpression,
) => {
	let text = getValidTemplateHeadText(templateExpression);

	if (text !== null) {
		state.keyHeads.add(text);
	}
};

let addTemplateTailTextToKeyTails = (
	state: State,
	templateExpression: TemplateExpression,
) => {
	let text = getValidTemplateTailText(templateExpression);

	if (text !== null) {
		state.keyTails.add(text);
	}
};

let handleJSXElement = (
	element: JsxSelfClosingElement | JsxOpeningElement,
	state: State,
) => {
	let attributes = element.getAttributes();

	attributes.forEach((attribute) => {
		let propValueNode = attribute.getFirstChildByKind(
			SyntaxKind.StringLiteral,
		);

		if (propValueNode) {
			let propValue = propValueNode.getLiteralValue();
			if (isNotSnakeCase(propValue)) {
				return;
			}
			state.translations.add(propValue);
		}
	});
};

let handleCallExpression = (
	callExpression: CallExpression,
	name: TranslationFunctionNames,
	state: State,
) => {
	let [arg1, arg2] = callExpression.getArguments();

	let translationKeyArgs = name === 'getTextBody' ? [arg1, arg2] : [arg1];

	translationKeyArgs.forEach((translationKeyArg) => {
		if (Node.isStringLiteral(translationKeyArg)) {
			state.translations.add(translationKeyArg.getLiteralText());
		}

		if (Node.isTemplateExpression(translationKeyArg)) {
			addTemplateHeadTextToKeyHeads(state, translationKeyArg);
			addTemplateTailTextToKeyTails(state, translationKeyArg);
		}

		if (
			Node.isConditionalExpression(translationKeyArg) ||
			Node.isBinaryExpression(translationKeyArg)
		) {
			let keyLikeStringLiterals = translationKeyArg
				.getDescendantsOfKind(SyntaxKind.StringLiteral)
				.filter((s) =>
					/^[a-z1-9]+(_[a-z1-9]+)*$/.test(s.getLiteralText()),
				);

			keyLikeStringLiterals.forEach((literal) => {
				state.translations.add(literal.getLiteralText());
			});
		}
	});
};

let handleJsxOpeningElement = (
	jsxOpeningElement: JsxOpeningElement,
	state: State,
) => {
	jsxOpeningElement.getAttributes().forEach((attribute) => {
		if (!Node.isJsxAttribute(attribute)) {
			return;
		}

		let initializer = attribute.getInitializer();

		if (Node.isStringLiteral(initializer)) {
			state.translations.add(initializer.getLiteralText());
			return;
		}

		if (Node.isJsxExpression(initializer)) {
			let expression = initializer.getExpression();

			if (Node.isTemplateExpression(expression)) {
				addTemplateHeadTextToKeyHeads(state, expression);
				addTemplateTailTextToKeyTails(state, expression);
				return;
			}

			if (
				Node.isConditionalExpression(expression) ||
				Node.isBinaryExpression(expression)
			) {
				let keyLikeStringLiterals = expression
					.getDescendantsOfKind(SyntaxKind.StringLiteral)
					.filter((s) => isNotSnakeCase(s.getLiteralText()));

				keyLikeStringLiterals.forEach((literal) => {
					state.translations.add(literal.getLiteralText());
				});
			}
			return;
		}
	});
};

let handleTransNamedImport = (
	importSpecifier: ImportSpecifier,
	state: State,
) => {
	let nameNode = importSpecifier.getNameNode();

	nameNode.findReferencesAsNodes().forEach((reference) => {
		let parent = reference.getParent();

		if (!Node.isJsxOpeningElement(parent)) {
			return;
		}

		handleJsxOpeningElement(parent, state);
	});
};

let handleImportDeclaration = (
	importDeclaration: ImportDeclaration,
	state: State,
) => {
	let moduleSpecifierText = importDeclaration
		.getModuleSpecifier()
		.getLiteralText();

	if (moduleSpecifierText === 'next-i18next') {
		let transNamedImport = importDeclaration
			.getNamedImports()
			.find((namedImport) => namedImport.getName() === 'Trans');

		if (transNamedImport) {
			handleTransNamedImport(transNamedImport, state);
		}
	}
};

let getCallExpressionName = (callExpression: CallExpression) => {
	let expr = callExpression.getExpression();

	if (Node.isIdentifier(expr)) {
		return expr.getText();
	}

	if (Node.isPropertyAccessExpression(expr)) {
		return expr.getNameNode().getText();
	}

	return null;
};

let handleSourceFile = (sourceFile: SourceFile, state: State) => {
	sourceFile
		.getImportDeclarations()
		.forEach((importDeclaration) =>
			handleImportDeclaration(importDeclaration, state),
		);

	sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
		.forEach((element) => {
			if (element.getTagNameNode().getFullText().length === 0) {
				return;
			}
			handleJSXElement(element, state);
		});

	sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
		.forEach((element) => {
			if (element.getTagNameNode().getFullText().length === 0) {
				return;
			}
			handleJSXElement(element, state);
		});

	// handle t and language callExpressions
	sourceFile
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.forEach((callExpression) => {
			let name = getCallExpressionName(callExpression);

			if (name === null || !isTranslationFunctionName(name)) {
				return;
			}

			handleCallExpression(callExpression, name, state);
		});

	return sourceFile;
};

let buildSourceFile = (
	tsmorph: Dependencies['tsmorph'],
	data: string,
	path: string,
) => {
	let project = new tsmorph.Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	return project.createSourceFile(String(path), String(data));
};

let handleLocaleFile = (sourceFile: SourceFile, state: State) => {
	let objectLiteralExpression = sourceFile.getDescendantsOfKind(
		SyntaxKind.ObjectLiteralExpression,
	)[0];

	objectLiteralExpression?.getProperties().forEach((propertyAssignment) => {
		if (!Node.isPropertyAssignment(propertyAssignment)) {
			return;
		}

		let nameNode = propertyAssignment.getNameNode();

		if (!Node.isStringLiteral(nameNode)) {
			return;
		}

		let name = nameNode.getLiteralText();

		for (let keyHead of state.keyHeads) {
			if (name.startsWith(keyHead)) {
				return;
			}
		}

		for (let keyTail of state.keyTails) {
			if (name.endsWith(keyTail)) {
				return;
			}
		}

		if (state.translations.has(name)) {
			return;
		}

		propertyAssignment.remove();
	});
};

type State = {
	translations: Set<string>;
	keyHeads: Set<string>;
	keyTails: Set<string>;
	translationsCollected: boolean;
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/*.{js,jsx,ts,tsx,cjs,mjs,json}'],
	excludePatterns: ['**/node_modules/**'],
	initializeState: async (_, previousState) => {
		return (
			previousState ?? {
				translations: new Set(),
				keyHeads: new Set(),
				keyTails: new Set(),
				translationsCollected: false,
			}
		);
	},
	handleFinish: async (_, state) => {
		if (state === null || state.translationsCollected) {
			return { kind: 'noop' };
		}

		state.translationsCollected = true;

		return {
			kind: 'restart',
		};
	},
	handleData: async (api, path, data, options, state) => {
		if (state === null) {
			return {
				kind: 'noop',
			};
		}

		if (!state.translationsCollected && !path.endsWith('.json')) {
			let { tsmorph } = api.getDependencies();

			handleSourceFile(buildSourceFile(tsmorph, data, path), state);
		}

		if (
			state.translationsCollected &&
			(state.translations.size !== 0 ||
				state.keyHeads.size !== 0 ||
				state.keyTails.size !== 0) &&
			path.includes('public/static/locales')
		) {
			let sourceFile = buildSourceFile(tsmorph, `(${data})`, path);
			handleLocaleFile(sourceFile, state);
			let fullText = sourceFile.getFullText();

			return {
				kind: 'upsertData',
				path,
				data: sourceFile.getFullText().slice(1, fullText.length - 1),
			};
		}

		return {
			kind: 'noop',
		};
	},
};
