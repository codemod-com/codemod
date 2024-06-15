import type {
	ImportDeclaration,
	JsxElement,
	JsxOpeningElement,
	SourceFile,
} from 'ts-morph';
import { type CallExpression, Node, SyntaxKind, ts } from 'ts-morph';

import { handleSourceFile as handleSourceFileCore } from '../../../replace-feature-flag-core/src/index.js';
import type {
	Options,
	Provider,
	VariableType,
	VariableValue,
} from '../../../replace-feature-flag-core/src/types.js';

import {
	buildLiteral,
	getCEExpressionName,
} from '../../../replace-feature-flag-core/src/utils.js';

let names = ['useFlag'];

let getVariableValueReplacerNode = (
	_: string,
	type: VariableType,
	value: VariableValue,
) => {
	return buildLiteral(type, value);
};

type MatchedMethod = {
	name: string;
};

export let provider: Provider = {
	getMatcher:
		(keyName: string) =>
		(ce: CallExpression): MatchedMethod | null => {
			let name = getCEExpressionName(ce);

			if (name === null || !names.includes(name)) {
				return null;
			}

			let args = ce.getArguments();
			let keyArg = args.at(0);

			if (
				Node.isStringLiteral(keyArg) &&
				keyArg.getLiteralText() === keyName
			) {
				return { name };
			}

			return null;
		},
	getReplacer: (key: string, type: VariableType, value: VariableValue) => {
		return getVariableValueReplacerNode(key, type, value);
	},
};

let removeMockFeatureFlagComponent = (mockFeatureFlag: JsxElement) => {
	let children = mockFeatureFlag
		.getJsxChildren()
		.filter((c) => !(Node.isJsxText(c) && c.getFullText().trim() === ''));

	let text = children.reduce<string>((acc, child) => {
		// biome-ignore lint: args reassing
		acc += `${child.getFullText()}`;
		return acc;
	}, '');

	mockFeatureFlag.replaceWithText(
		children.length === 1 ? text : `<>${text}</>`,
	);
};

let removeImportIfUnused = (mockFeatureFlagImport: ImportDeclaration) => {
	let namedImports = mockFeatureFlagImport.getNamedImports();

	if (namedImports.length !== 0) {
		return;
	}

	mockFeatureFlagImport.remove();
};

let matchMockFeatureFlag = (jsx: JsxOpeningElement) => {
	if (
		jsx.wasForgotten() ||
		jsx.getTagNameNode()?.getFullText() !== 'MockFeatureFlag'
	) {
		return null;
	}

	let mockFlagsAttribute = jsx
		.getAttribute('mockFlags')
		?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);

	if (mockFlagsAttribute === undefined) {
		return null;
	}

	let tag = jsx.getTagNameNode();

	if (!Node.isIdentifier(tag)) {
		return null;
	}

	let parent = jsx.getParent();

	if (!Node.isJsxElement(parent)) {
		return null;
	}

	let importDeclaration = tag
		?.getDefinitions()
		.at(0)
		?.getNode()
		?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);

	return {
		mockFlagsAttribute,
		jsx,
		tag,
		parent,
		importDeclaration,
	};
};

let removeFeatureFlagKeyFromFlagsDict = (
	sourceFile: SourceFile,
	options: Options,
) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.TypeAliasDeclaration)
		.forEach((tad) => {
			if (tad.getName() !== 'FlagDict') {
				return;
			}

			let type = tad.getTypeNode();

			if (!Node.isTypeLiteral(type)) {
				return;
			}

			type.getProperty(options.key)?.remove();
		});
};

let removeMockFlagsAttributes = (sourceFile: SourceFile, options: Options) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
		.forEach((jsx) => {
			let match = matchMockFeatureFlag(jsx);

			if (match === null) {
				return;
			}

			let { mockFlagsAttribute, parent, importDeclaration } = match;

			mockFlagsAttribute.getProperty(options.key)?.remove();

			// remove the whole Provider and its import if no properties left after key removal
			if (mockFlagsAttribute.getProperties().length === 0) {
				removeMockFeatureFlagComponent(parent);

				if (importDeclaration !== undefined) {
					removeImportIfUnused(importDeclaration);
				}
			}
		});
};

let removeMockFeatureFlagArgs = (sourceFile: SourceFile, options: Options) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
		.forEach((ole) => {
			ole.getProperty(options.key)?.remove();
		});
};

export function handleSourceFile(
	sourceFile: SourceFile,
	options: Omit<Options, 'provider'>,
): string | undefined {
	let filePath = sourceFile.getFilePath();

	let optionsWithProvider = { ...options, provider };

	/**
	 * Removes the feature flag key type property from FlagDict
	 */

	if (filePath.endsWith('FeatureFlagProvider.tsx')) {
		removeFeatureFlagKeyFromFlagsDict(sourceFile, optionsWithProvider);
		return sourceFile.getFullText();
	}

	/**
	 * removes feature flag key from mockFlags attribute in MockFeatureFlag component
	 */
	if (filePath.endsWith('spec.tsx')) {
		removeMockFlagsAttributes(sourceFile, optionsWithProvider);
		return sourceFile.getFullText();
	}

	/**
	 * removes feature flag from stories `args`
	 */
	if (filePath.endsWith('stories.tsx')) {
		removeMockFeatureFlagArgs(sourceFile, optionsWithProvider);
		return sourceFile.getFullText();
	}

	return handleSourceFileCore(sourceFile, optionsWithProvider);
}
