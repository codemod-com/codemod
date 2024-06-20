import { isAbsolute, join, parse, relative } from 'node:path';
import type { Filemod, UnifiedFileSystem } from '@codemod-com/filemod';
import type { fromMarkdown } from 'mdast-util-from-markdown';
import type {
	ArrowFunction,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	ImportDeclaration,
	ImportDeclarationStructure,
	JsxAttribute,
	JsxElement,
	JsxExpression,
	JsxOpeningElement,
	JsxSelfClosingElement,
	SourceFile,
	StringLiteral,
} from 'ts-morph';
import tsmorph, { ModuleKind, Node, SyntaxKind } from 'ts-morph';
import type { filter } from 'unist-util-filter';
import type { visit } from 'unist-util-visit';

/**
 * Copied from "../replace-next-head"
 */

type Dependency = {
	kind: SyntaxKind;
	text: string;
	structure: ImportDeclarationStructure | null;
	isBindingPattern?: boolean;
};

let openGraphWebsiteTags = [
	'og:type',
	'og:determiner',
	'og:title',
	'og:description',
	'og:url',
	'og:site_name',
	'og:locale',
	'og:locale:alternate',
	'og:country_name',
	'og:ttl',
	'og:image',
	'og:image:url',
	'og:image:width',
	'og:image:height',
	'og:image:alt',
	'og:audio',
	'og:audio:secure_url',
	'og:audio:type',
	'og:video',
	'og:video:secure_url',
	'og:video:type',
	'og:video:width',
	'og:video:height',
];

let openGraphArticleTags = [
	'article:published_time',
	'article:modified_time',
	'article:expiration_time',
	'article:author',
	'article:section',
	'article:tag',
];

let twitterTags = [
	'twitter:card',
	'twitter:site',
	'twitter:site:id',
	'twitter:creator',
	'twitter:creator:id',
	'twitter:title',
	'twitter:description',
];

// @TODO card=app
// @TODO card=player

// @TODO appLinks

let alternatesLinks = ['canonical', 'alternate'];

let basicTags = [
	'title',
	'description',
	'application-name',
	'author',
	'manifest',
	'generator',
	'keywords',
	'referrer',
	'theme-color',
	'color-scheme',
	'viewport',
	'creator',
	'publisher',
	'robots',
	'abstract',
	'archives',
	'assets',
	'bookmarks',
	'category',
	'classification',
];

let iTunesMeta = ['apple-itunes-app'];
let formatDetectionTags = ['format-detection'];
// @TODO AppleWebAppMeta
let verificationTags = [
	'google-site-verification',
	'y_key',
	'yandex-verification',
];

let iconTags = ['icon', 'apple-touch-icon', 'shortcut icon', 'mask-icon'];

let otherMetaTags = ['msapplication-TileColor', 'msapplication-config'];

let knownNames = [
	...openGraphWebsiteTags,
	...openGraphArticleTags,
	...twitterTags,
	...alternatesLinks,
	...basicTags,
	...iTunesMeta,
	...formatDetectionTags,
	...verificationTags,
	...iconTags,
	...otherMetaTags,
];

export let camelize = (str: string) =>
	str.replace(/[-_]([a-z])/g, (g) => (g[1] ?? '').toUpperCase());

export let buildContainer = <T,>(initialValue: T) => {
	let currentValue: T = initialValue;

	let get = (): T => {
		return currentValue;
	};

	let set = (callback: (previousValue: T) => T): void => {
		currentValue = callback(currentValue);
	};

	return {
		get,
		set,
	};
};

type Container<T> = ReturnType<typeof buildContainer<T>>;

let getStructure = (node: Node) => {
	if (Node.isImportDeclaration(node)) {
		return node.getStructure();
	}

	return null;
};

let DEPENDENCY_TREE_MAX_DEPTH = 5;

let getAncestorByDeclaration = (declarationNode: Node): Node | null => {
	let ancestor: Node | null = null;

	let parameter = Node.isParameterDeclaration(declarationNode)
		? declarationNode
		: declarationNode.getFirstAncestorByKind(SyntaxKind.Parameter);
	let importDeclaration = declarationNode.getFirstAncestorByKind(
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
			declarationNode.getFirstAncestorByKind(
				SyntaxKind.VariableStatement,
			) ?? null;
	}

	return ancestor;
};

let getDependenciesForIdentifiers = (
	identifiers: ReadonlyArray<Identifier>,
	depth = 0,
) => {
	if (depth > DEPENDENCY_TREE_MAX_DEPTH) {
		return {};
	}

	let dependencies: Record<string, Dependency> = {};

	identifiers.forEach((identifier) => {
		let parent = identifier.getParent();

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

		let [firstDeclaration] =
			identifier.getSymbol()?.getDeclarations() ?? [];

		let localSourceFile = identifier.getFirstAncestorByKind(
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

		let ancestor = getAncestorByDeclaration(firstDeclaration);

		if (ancestor === null) {
			return;
		}

		dependencies[identifier.getText()] = {
			text: ancestor.getText(),
			structure: getStructure(ancestor),
			kind: ancestor.getKind(),
			isBindingPattern:
				ancestor.getKind() === SyntaxKind.Parameter &&
				ancestor.getFirstDescendantByKind(
					SyntaxKind.ObjectBindingPattern,
				) !== undefined,
		};

		// recursivelly check for dependencies until reached parameter or import
		if (
			Node.isImportDeclaration(ancestor) ||
			Node.isParameterDeclaration(ancestor)
		) {
			return;
		}

		let ancestorIdentifiers = ancestor
			.getDescendantsOfKind(SyntaxKind.Identifier)
			.filter((i) => {
				if (i.getText() === identifier.getText()) {
					return false;
				}

				if (ancestor && Node.isFunctionDeclaration(ancestor)) {
					let declaration = i.getSymbol()?.getDeclarations()[0];

					// ensure we dont collect identifiers from function inner scope in nested functions
					if (
						declaration?.getFirstAncestorByKind(
							SyntaxKind.FunctionDeclaration,
						) === ancestor
					) {
						return false;
					}
				}

				let parent = i.getParent();

				return (
					!Node.isBindingElement(parent) &&
					!Node.isPropertyAssignment(parent) &&
					!(
						Node.isPropertyAccessExpression(parent) &&
						i.getChildIndex() !== 0
					)
				);
			});

		let dependenciesOfAncestor = getDependenciesForIdentifiers(
			ancestorIdentifiers,
			depth + 1,
		);
		Object.assign(dependencies, dependenciesOfAncestor);
	});

	return dependencies;
};

let handleJsxSelfClosingElement = (
	jsxSelfClosingElement: JsxSelfClosingElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	let tagName = jsxSelfClosingElement.getTagNameNode().getText();

	if (!['link', 'meta'].includes(tagName)) {
		return;
	}

	let ancestorBinaryExpression = jsxSelfClosingElement.getFirstAncestorByKind(
		SyntaxKind.BinaryExpression,
	);

	let ancestorConditionalExpression =
		jsxSelfClosingElement.getFirstAncestorByKind(
			SyntaxKind.ConditionalExpression,
		);

	let binaryExpr = ancestorBinaryExpression?.getLeft();
	let conditionalExpr = ancestorConditionalExpression?.getCondition();

	let conditionExpr = binaryExpr ?? conditionalExpr;

	let identifiers =
		conditionExpr?.getDescendantsOfKind(SyntaxKind.Identifier) ?? [];

	let dependencies = getDependenciesForIdentifiers(identifiers);

	settingsContainer.set((prev) => ({
		...prev,
		dependencies: { ...prev.dependencies, ...dependencies },
	}));

	let metadataAttributes = jsxSelfClosingElement
		.getAttributes()
		.filter((attribute): attribute is JsxAttribute =>
			Node.isJsxAttribute(attribute),
		)
		.reduce<Record<string, string>>((metadataAttributes, attribute) => {
			let name = attribute.getNameNode().getText();
			let initializer = attribute.getInitializer();

			if (Node.isStringLiteral(initializer)) {
				metadataAttributes[name] = initializer.getFullText();
			}

			if (Node.isJsxExpression(initializer)) {
				let identifiers = initializer.getDescendantsOfKind(
					SyntaxKind.Identifier,
				);

				let dependencies = getDependenciesForIdentifiers(identifiers);

				settingsContainer.set((prev) => ({
					...prev,
					dependencies: { ...prev.dependencies, ...dependencies },
				}));

				metadataAttributes[name] =
					initializer.getExpression()?.getText() ?? '';
			}

			return metadataAttributes;
		}, {});

	let metadataName = (
		tagName === 'link'
			? metadataAttributes.rel
			: metadataAttributes.name ?? metadataAttributes.property
	)?.replace(/\"/g, '');

	if (metadataName && knownNames.includes(metadataName)) {
		handleTag(
			{
				tagName,
				metadataName,
				metadataAttributes,
				conditionText:
					binaryExpr?.getText() ?? conditionalExpr?.getText(),
			},
			metadataContainer,
		);
	}
};

let handleHeadChildJsxElement = (
	jsxElement: JsxElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	if (jsxElement.getOpeningElement().getTagNameNode().getText() !== 'title') {
		return;
	}

	let children = jsxElement.getJsxChildren();

	let text = '';

	let ancestorBinaryExpression = jsxElement.getFirstAncestorByKind(
		SyntaxKind.BinaryExpression,
	);

	let ancestorConditionalExpression = jsxElement.getFirstAncestorByKind(
		SyntaxKind.ConditionalExpression,
	);

	let binaryExpr = ancestorBinaryExpression?.getLeft();
	let conditionalExpr = ancestorConditionalExpression?.getCondition();

	let conditionExpr = binaryExpr ?? conditionalExpr;

	let identifiers =
		conditionExpr?.getDescendantsOfKind(SyntaxKind.Identifier) ?? [];
	let dependencies = getDependenciesForIdentifiers(identifiers);

	settingsContainer.set((prev) => ({
		...prev,
		dependencies: { ...prev.dependencies, ...dependencies },
	}));

	children.forEach((child) => {
		if (Node.isJsxText(child)) {
			text += child.getFullText();
		} else if (Node.isJsxExpression(child)) {
			let expression = child.getExpression();
			let identifiers = child.getDescendantsOfKind(SyntaxKind.Identifier);

			settingsContainer.set((prev) => ({
				...prev,
				dependencies: {
					...prev.dependencies,
					...getDependenciesForIdentifiers(identifiers),
				},
			}));

			if (Node.isTemplateExpression(expression)) {
				let t = expression.getFullText().replace(/\`/g, '');
				text += t;
				return;
			}

			let expressionText = expression?.getText() ?? null;

			if (expressionText === null) {
				return;
			}

			text += `\${${expressionText}}`;
		}
	});

	handleTag(
		{
			tagName: 'title',
			metadataName: 'title',
			metadataAttributes: {
				children: `\`${text}\``,
			},
			conditionText: binaryExpr?.getText() ?? conditionalExpr?.getText(),
		},
		metadataContainer,
	);
};

let handleHeadChild = (
	child: Node,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	if (Node.isJsxElement(child)) {
		handleHeadChildJsxElement(child, metadataContainer, settingsContainer);
	}

	if (Node.isJsxSelfClosingElement(child)) {
		handleJsxSelfClosingElement(
			child,
			metadataContainer,
			settingsContainer,
		);
	}

	if (Node.isParenthesizedExpression(child)) {
		handleHeadChild(
			child.getExpression(),
			metadataContainer,
			settingsContainer,
		);
	}

	if (Node.isJsxExpression(child)) {
		let expression = child.getExpression();

		if (Node.isBinaryExpression(expression)) {
			handleHeadChild(
				expression.getRight(),
				metadataContainer,
				settingsContainer,
			);
		}

		if (Node.isConditionalExpression(expression)) {
			let whenTrue = expression.getWhenTrue();
			let whenFalse = expression.getWhenFalse();

			[whenTrue, whenFalse].forEach((expression) =>
				handleHeadChild(
					expression,
					metadataContainer,
					settingsContainer,
				),
			);
		}
	}
};

let handleHeadJsxElement = (
	headJsxElement: JsxElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	let jsxChildren = headJsxElement.getJsxChildren();

	jsxChildren.forEach((child) => {
		handleHeadChild(child, metadataContainer, settingsContainer);
	});
};

let handleHeadIdentifier = (
	headIdentifier: Identifier,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	headIdentifier.findReferencesAsNodes().forEach((node) => {
		let parent = node.getParent();

		if (Node.isJsxOpeningElement(parent)) {
			let grandparent = parent.getParent();

			if (Node.isJsxElement(grandparent)) {
				handleHeadJsxElement(
					grandparent,
					metadataContainer,
					settingsContainer,
				);
			}
		}
	});
};

export let handleImportDeclaration = (
	importDeclaration: ImportDeclaration,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	let moduleSpecifier = importDeclaration.getModuleSpecifier();

	if (moduleSpecifier.getLiteralText() !== 'next/head') {
		return;
	}

	let headIdentifier = importDeclaration.getDefaultImport() ?? null;

	if (headIdentifier === null) {
		return;
	}

	handleHeadIdentifier(headIdentifier, metadataContainer, settingsContainer);
};

export let handleTag = (
	{
		tagName,
		metadataName,
		metadataAttributes,
		conditionText,
	}: {
		tagName: string;
		metadataName: string;
		metadataAttributes: Record<string, string>;
		conditionText?: string;
	},
	metadataContainer: Container<Record<string, any>>,
) => {
	let metadataObject = metadataContainer.get();
	if (metadataName === 'title') {
		metadataObject[metadataName] = metadataAttributes.children ?? '';
		metadataObject[`_CONDITION_TEXT_${metadataName}`] = conditionText;
	}

	if (tagName === 'meta') {
		let content = metadataAttributes.content;

		if (otherMetaTags.includes(metadataName)) {
			if (!metadataObject.other) {
				metadataObject.other = {};
			}

			metadataObject.other[metadataName] = content;
			return;
		}

		if (metadataName.startsWith('article')) {
			let { content } = metadataAttributes;

			if (!metadataObject.openGraph) {
				metadataObject.openGraph = {};
			}

			if (metadataName === 'article:author') {
				if (!metadataObject.openGraph.authors) {
					metadataObject.openGraph.authors = [];
				}

				metadataObject.openGraph.authors.push(content);

				return;
			}

			if (metadataName === 'article:tag') {
				if (!metadataObject.openGraph.tags) {
					metadataObject.openGraph.tags = [];
				}

				metadataObject.openGraph.tags.push(content);

				return;
			}

			metadataObject.openGraph[
				camelize(metadataName.replace('article:', ''))
			] = content;

			return;
		}

		if (metadataName === 'author') {
			if (!metadataObject.authors) {
				metadataObject.authors = [];
			}

			metadataObject.authors.push({ name: content });
			return;
		}

		if (metadataName === 'theme-color') {
			let { content, media } = metadataAttributes;

			if (!content && !media) {
				return;
			}

			if (!metadataObject.themeColor) {
				metadataObject.themeColor = [];
			}

			let themeColorObj = {
				...(media && { media }),
				...(content && { color: content }),
			};

			metadataObject.themeColor.push(themeColorObj);

			return;
		}

		if (metadataName === 'googlebot') {
			return;
		}

		if (metadataName.startsWith('og:')) {
			let n = camelize(metadataName.replace('og:', ''));

			if (!metadataObject.openGraph) {
				metadataObject.openGraph = {};
			}

			// image structured property
			if (metadataName.startsWith('og:image')) {
				let { content } = metadataAttributes;

				if (!metadataObject.openGraph.images) {
					metadataObject.openGraph.images = [];
				}

				if (
					metadataName === 'og:image:url' ||
					metadataName === 'og:image'
				) {
					metadataObject.openGraph.images.push({
						url: content,
					});
				} else {
					let image = metadataObject.openGraph.images.at(-1);
					let propName = metadataName.replace('og:image:', '');

					image[propName] = content;
				}

				return;
			}

			if (metadataName.startsWith('og:audio')) {
				let { content } = metadataAttributes;

				if (!metadataObject.openGraph.audio) {
					metadataObject.openGraph.audio = [];
				}

				if (metadataName === 'og:audio') {
					metadataObject.openGraph.audio.push({
						url: content,
					});
				} else {
					let audio = metadataObject.openGraph.audio.at(-1);
					let propName = metadataName.replace('og:audio:', '');

					audio[camelize(propName)] = content;
				}

				return;
			}

			if (metadataName.startsWith('og:video')) {
				let { content } = metadataAttributes;

				if (!metadataObject.openGraph.videos) {
					metadataObject.openGraph.videos = [];
				}

				if (metadataName === 'og:video') {
					metadataObject.openGraph.videos.push({
						url: content,
					});
				} else {
					let video = metadataObject.openGraph.videos.at(-1);
					let propName = metadataName.replace('og:video:', '');

					video[camelize(propName)] = content;
				}

				return;
			}

			if (metadataName === 'og:locale:alternate') {
				let { content } = metadataAttributes;

				if (!metadataObject.openGraph.alternateLocale) {
					metadataObject.openGraph.alternateLocale = [];
				}

				metadataObject.openGraph.alternateLocale.push(content);
				return;
			}

			metadataObject.openGraph[n] = content;
			return;
		}

		if (metadataName.startsWith('twitter:')) {
			let n = camelize(metadataName.replace('twitter:', ''));

			if (!metadataObject.twitter) {
				metadataObject.twitter = {};
			}

			if (metadataName === 'twitter:site:id') {
				metadataObject.twitter.siteId = content;
				return;
			}

			if (metadataName === 'twitter:creator:id') {
				metadataObject.twitter.creatorId = content;
				return;
			}

			metadataObject.twitter[n] = content;
			return;
		}

		let verification: Record<string, string> = {
			'google-site-verification': 'google',
			'yandex-verification': 'yandex',
			y_key: 'yahoo',
		};

		if (Object.keys(verification).includes(metadataName)) {
			if (!metadataObject.verification) {
				metadataObject.verification = {};
			}

			let propName = verification[metadataName];

			if (!propName) {
				return;
			}

			metadataObject.verification[propName] = content;
			return;
		}

		if (metadataName === 'format-detection') {
			return;
		}

		let propertyName = camelize(metadataName);
		metadataObject[propertyName] = content;
		metadataObject[`_CONDITION_TEXT_${metadataName}`] = conditionText;
	}

	if (tagName === 'link') {
		let content = metadataAttributes.href;

		if (metadataName === 'author') {
			if (metadataObject.authors.length === 0) {
				return;
			}

			metadataObject.authors[metadataObject.authors.length - 1].url =
				content;

			return;
		}

		if (['archives', 'assets', 'bookmarks'].includes(metadataName)) {
			if (!metadataObject[metadataName]) {
				metadataObject[metadataName] = [];
			}

			metadataObject[metadataName].push(content);

			return;
		}

		if (['canonical', 'alternate'].includes(metadataName)) {
			if (!metadataObject.alternates) {
				metadataObject.alternates = {};
			}

			if (metadataName === 'canonical') {
				metadataObject.alternates[metadataName] = content;
			}

			let { hreflang, media, type, href } = metadataAttributes;

			if (hreflang) {
				if (!metadataObject.alternates.languages) {
					metadataObject.alternates.languages = {};
				}

				metadataObject.alternates.languages[hreflang] = href;
			}

			if (media) {
				if (!metadataObject.alternates.media) {
					metadataObject.alternates.media = {};
				}

				metadataObject.alternates.media[media] = href;
			}

			if (type) {
				if (!metadataObject.alternates.types) {
					metadataObject.alternates.types = {};
				}

				metadataObject.alternates.types[type] = href;
			}

			return;
		}

		let otherIcons = ['mask-icon'];

		let icons: Record<string, string> = {
			'shortcut icon': 'shortcut',
			icon: 'icon',
			'apple-touch-icon': 'apple',
			'mask-icon': 'other',
			...Object.fromEntries(
				otherIcons.map((otherIcon) => [otherIcon, 'other']),
			),
		};

		if (Object.keys(icons).includes(metadataName)) {
			let iconTypeName = icons[metadataName];
			let { sizes, type, href, rel } = metadataAttributes;

			if (!iconTypeName) {
				return;
			}

			if (!metadataObject.icons) {
				metadataObject.icons = {};
			}

			if (!metadataObject.icons[iconTypeName]) {
				metadataObject.icons[iconTypeName] = [];
			}

			let shouldIncludeRel = otherIcons.includes(metadataName);

			let iconMetadataObject = {
				...(sizes && { sizes }),
				...(type && { type }),
				...(href && { url: href }),
				...(shouldIncludeRel && rel && { rel }),
			};

			metadataObject.icons[iconTypeName].push(iconMetadataObject);
			return;
		}

		if (metadataName.startsWith('al:')) {
			return;
		}

		let propertyName = camelize(metadataName);
		metadataObject[propertyName] = content;
	}

	metadataContainer.set(() => metadataObject);
};

let isValidIdentifier = (identifierName: string): boolean => {
	if (identifierName.length === 0) {
		return false;
	}

	if (!/[a-zA-Z_]/.test(identifierName.charAt(0))) {
		return false;
	}

	let validChars = /^[a-zA-Z0-9_]*$/;
	return validChars.test(identifierName);
};

let isDoubleQuotified = (str: string) =>
	str.startsWith('"') && str.endsWith('"');

function formatObjectAsString(metadataObject: Record<string, any>) {
	let pairs: string[] = [];

	for (let [key, value] of Object.entries(metadataObject)) {
		if (key.startsWith('_')) {
			continue;
		}

		let conditionText = metadataObject[`_CONDITION_TEXT_${key}`];

		if (Array.isArray(value)) {
			let formattedArray = value.map((element) =>
				typeof element === 'object' && element !== null
					? formatObjectAsString(element)
					: String(element),
			);

			let pair = `${key}: [${formattedArray.join(', \n')}]`;
			let pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		} else if (typeof value === 'object' && value !== null) {
			let pair = `${key}: ${formatObjectAsString(value)}`;
			let pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		} else {
			let keyIsValidIdentifier = isValidIdentifier(key);
			let keyDoubleQuotified = isDoubleQuotified(key);

			let pair = `${
				!keyIsValidIdentifier && !keyDoubleQuotified ? `"${key}"` : key
			}: ${value}`;
			let pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		}
	}

	return `{ \n ${pairs.join(', \n')} \n }`;
}

let buildMetadataStatement = (metadataObject: Record<string, unknown>) => {
	return `export const metadata: Metadata = ${formatObjectAsString(
		metadataObject,
	)}`;
};

type Root = ReturnType<typeof fromMarkdown>;

type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
	parseMdx?: (data: string) => Root;
	stringifyMdx?: (tree: Root) => string;
	visitMdxAst?: typeof visit;
	filterMdxAst?: typeof filter;
	unifiedFileSystem: UnifiedFileSystem;
}>;

type State = Record<string, unknown>;

type MetadataTreeNode = {
	path: string;
	components: Record<string, MetadataTreeNode>;
	metadata: Record<string, unknown>;
	dependencies: Record<string, Dependency>;
};

type FileAPI = Parameters<
	NonNullable<Filemod<Dependencies, State>['handleFile']>
>[0];

export let projectContainer = buildContainer<tsmorph.Project | null>(null);
export let subTreeCacheContainer = buildContainer<
	Map<string, MetadataTreeNode>
>(new Map());

let defaultCompilerOptions = {
	allowJs: true,
	module: ModuleKind.CommonJS,
	traceResolution: true,
};

export let buildComponentMetadata = (
	sourceFile: SourceFile,
): {
	metadata: Record<string, unknown>;
	dependencies: Record<string, Dependency>;
} => {
	let metadataContainer = buildContainer<Record<string, any>>({});
	let settingsContainer = buildContainer<Record<string, any>>({});

	let importDeclarations = sourceFile.getImportDeclarations();

	importDeclarations.forEach((importDeclaration) =>
		handleImportDeclaration(
			importDeclaration,
			metadataContainer,
			settingsContainer,
		),
	);

	return {
		metadata: metadataContainer.get(),
		dependencies: settingsContainer.get().dependencies,
	};
};

let removeMdxNodes = (
	{ visitMdxAst, filterMdxAst, stringifyMdx, parseMdx }: Dependencies,
	content: string,
): string => {
	if (!filterMdxAst || !visitMdxAst || !stringifyMdx || !parseMdx) {
		return content;
	}

	try {
		let tree = parseMdx(content);

		let newTree = filterMdxAst(tree, (node) => {
			return ['root', 'mdxJsxFlowElement', 'mdxjsEsm'].includes(
				node.type,
			);
		});

		if (newTree === undefined) {
			return content;
		}

		let mdxJsxFlowElements: string[] = [];

		visitMdxAst(newTree, (node) => {
			if (node.type === 'mdxJsxFlowElement') {
				// @ts-expect-error stringify any node
				let value = stringifyMdx(node);
				mdxJsxFlowElements.push(value);
			}
		});

		let stringifiedMdx = stringifyMdx(newTree);

		mdxJsxFlowElements.forEach((value) => {
			stringifiedMdx = stringifiedMdx.replace(value, `{${value}}`);
		});

		return stringifiedMdx;
	} catch (e) {
		console.error(e);
		return content;
	}
};

let initTsMorphProject = async (
	dependencies: Dependencies,
	unifiedFileSystem: Dependencies['unifiedFileSystem'],
	rootPath: string,
	compilerOptions?: tsmorph.CompilerOptions,
) => {
	let { tsmorph } = dependencies;

	let project = new tsmorph.Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			...defaultCompilerOptions,
			...compilerOptions,
			baseUrl: rootPath,
		},
	});

	let allFilePaths = await unifiedFileSystem.getFilePaths(
		rootPath,
		['**/*.{jsx,tsx,ts,js,cjs,ejs,mdx}'],
		['**/node_modules/**'],
	);

	for (let path of allFilePaths) {
		let content = await unifiedFileSystem.readFile(path);
		if (path.endsWith('.mdx')) {
			let contentWithoutMdxNodes = removeMdxNodes(dependencies, content);

			project.createSourceFile(
				path.replace('.mdx', '.tsx'),
				contentWithoutMdxNodes,
			);
			continue;
		}

		project.createSourceFile(path, content);
	}

	projectContainer.set(() => project);
};

let resolveModuleName = (path: string, containingPath: string) => {
	let project = projectContainer.get();

	if (project === null) {
		return null;
	}

	return (
		tsmorph.ts.resolveModuleName(
			path,
			containingPath,
			project.getCompilerOptions(),
			project.getModuleResolutionHost(),
			undefined,
			undefined,
			ModuleKind.CommonJS,
		).resolvedModule?.resolvedFileName ?? null
	);
};

let getComponentPaths = (sourceFile: SourceFile) => {
	let paths = sourceFile
		.getDescendants()
		.filter(
			(d): d is JsxOpeningElement | JsxSelfClosingElement =>
				Node.isJsxOpeningElement(d) || Node.isJsxSelfClosingElement(d),
		)
		.map((componentTag) => {
			let nameNode = componentTag.getTagNameNode();
			let declaration = nameNode.getSymbol()?.getDeclarations()[0];

			return (
				declaration
					?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
					?.getModuleSpecifier()
					.getLiteralText() ?? null
			);
		})
		.filter((path): path is string => path !== null);

	return Array.from(new Set(paths));
};

let mapRelativeToAbsolutePaths = (
	dependencies: Record<string, Dependency>,
	containingPath: string,
): Record<string, Dependency> =>
	Object.entries(dependencies).reduce<Record<string, Dependency>>(
		(acc, [key, val]) => {
			if (
				val.kind === SyntaxKind.ImportDeclaration &&
				val.structure !== null
			) {
				let resolvedModuleName =
					resolveModuleName(
						val.structure.moduleSpecifier ?? '',
						containingPath,
					) ?? val.structure.moduleSpecifier;

				acc[key] = {
					...val,
					structure: {
						...val.structure,
						moduleSpecifier: resolvedModuleName,
					},
				};

				return acc;
			}

			acc[key] = val;

			return acc;
		},
		{},
	);

let mergeNodes = (
	parent: MetadataTreeNode,
	child: MetadataTreeNode,
	pagePath: string,
) => {
	let componentPropsValues = findComponentPropValue(parent.path, child.path);

	let nextDependencies = Object.entries(child.dependencies).reduce(
		(acc, [identifierName, value]) => {
			if (value.kind === SyntaxKind.Parameter) {
				let propValue = componentPropsValues[identifierName] ?? null;

				// handle props object
				if (!value.isBindingPattern) {
					let propsObjectText = Object.entries(
						componentPropsValues,
					).reduce<Record<string, string>>((acc, [key, value]) => {
						acc[key] = Node.isJsxExpression(value)
							? value.getExpression()?.getText() ?? ''
							: value.getText();

						return acc;
					}, {});

					acc[identifierName] = {
						kind: SyntaxKind.VariableStatement,
						text: `const ${identifierName} = ${formatObjectAsString(
							propsObjectText,
						)}`,
						structure: null,
					};

					let identifiers: Identifier[] = [];

					Object.values(componentPropsValues).forEach((propValue) => {
						identifiers.push(
							...propValue.getDescendantsOfKind(
								SyntaxKind.Identifier,
							),
						);
					});

					let newDependencies =
						getDependenciesForIdentifiers(identifiers);

					Object.entries(newDependencies).forEach(
						([identifier, dependency]) => {
							if (
								pagePath === parent.path &&
								dependency.kind !== SyntaxKind.Parameter
							) {
								return;
							}

							acc[identifier] = dependency;
						},
					);

					return acc;
				}

				if (propValue === null) {
					return acc;
				}

				let identifiers = propValue.getDescendantsOfKind(
					SyntaxKind.Identifier,
				);

				let newDependencies =
					getDependenciesForIdentifiers(identifiers);

				//add dependencies of propValue
				Object.entries(newDependencies).forEach(
					([identifier, dependency]) => {
						if (
							pagePath === parent.path &&
							dependency.kind !== SyntaxKind.Parameter
						) {
							return;
						}

						acc[identifier] = dependency;
					},
				);

				// add propValue declaration

				let propValueText = Node.isJsxExpression(propValue)
					? propValue.getExpression()?.getText() ?? ''
					: propValue.getText();

				if (propValueText !== identifierName) {
					acc[identifierName] = {
						kind: SyntaxKind.VariableStatement,
						text: `const ${identifierName} = ${propValueText}`,
						structure: null,
					};
				}

				return acc;
			}

			acc[identifierName] = value;
			return acc;
		},
		{} as Record<string, Dependency>,
	);

	parent.metadata = {
		...parent.metadata,
		...child.metadata,
	};
	parent.dependencies = {
		...parent.dependencies,
		...nextDependencies,
	};
};

let buildMetadataTreeNode = (containingPath: string, pagePath: string) => {
	let subTreeCache = subTreeCacheContainer.get();
	let cachedTreeNode = subTreeCache.get(containingPath);

	if (cachedTreeNode !== undefined) {
		return cachedTreeNode;
	}

	let treeNode: MetadataTreeNode = {
		path: containingPath,
		components: {},
		metadata: {},
		dependencies: {},
	};

	let project = projectContainer.get();

	let sourceFile =
		project?.getSourceFile(containingPath.replace('.mdx', '.tsx')) ?? null;

	if (sourceFile === null) {
		return treeNode;
	}

	let { metadata, dependencies } = buildComponentMetadata(sourceFile);

	treeNode.metadata = metadata;
	treeNode.dependencies = mapRelativeToAbsolutePaths(
		dependencies ?? {},
		containingPath,
	);

	getComponentPaths(sourceFile).forEach((path) => {
		let resolvedFileName = resolveModuleName(path, containingPath);

		if (resolvedFileName === null) {
			return;
		}

		let childTreeNode = buildMetadataTreeNode(resolvedFileName, pagePath);

		treeNode.components[resolvedFileName] = childTreeNode;

		mergeNodes(treeNode, childTreeNode, pagePath);

		// cache
		subTreeCacheContainer.set((map) => map.set(treeNode.path, treeNode));
	});

	return treeNode;
};

let findComponentByModuleSpecifier = (
	sourceFile: SourceFile,
	componentAbsolutePath: string,
) => {
	return (
		sourceFile
			.getDescendants()
			.find((d): d is JsxOpeningElement | JsxSelfClosingElement => {
				if (
					!Node.isJsxOpeningElement(d) &&
					!Node.isJsxSelfClosingElement(d)
				) {
					return false;
				}

				let nameNode = d.getTagNameNode();
				let declaration = nameNode.getSymbol()?.getDeclarations()[0];

				let moduleSpecifier = declaration
					?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
					?.getModuleSpecifier()
					.getLiteralText();

				let absolutePath = resolveModuleName(
					moduleSpecifier ?? '',
					sourceFile.getFilePath().toString(),
				);

				return absolutePath === componentAbsolutePath;
			}) ?? null
	);
};

let findComponentPropValue = (
	path: string,
	componentPath: string,
): Record<string, JsxExpression | StringLiteral> => {
	let project = projectContainer.get();

	let sourceFile =
		project?.getSourceFile(path.replace('.mdx', '.tsx')) ?? null;

	if (sourceFile === null) {
		return {};
	}

	let component = findComponentByModuleSpecifier(sourceFile, componentPath);
	let propValue: Record<string, JsxExpression | StringLiteral> = {};

	let jsxAttributes =
		component?.getDescendantsOfKind(SyntaxKind.JsxAttribute) ?? [];

	jsxAttributes.forEach((jsxAttribute) => {
		let name = jsxAttribute.getNameNode().getText();

		let initializer = jsxAttribute.getInitializer();
		if (
			Node.isJsxExpression(initializer) ||
			Node.isStringLiteral(initializer)
		) {
			propValue[name] = initializer;
		}
	});

	return propValue;
};

let insertGenerateMetadataFunctionDeclaration = (
	sourceFile: SourceFile,
	metadataObject: Record<string, unknown>,
	propsParameterText: string,
) => {
	sourceFile.addStatements(
		`  
			export async function generateMetadata(
				{ params }: { params: Record<string, string | string[]>; },
			): Promise<Metadata> {
					const getStaticPropsResult  = await getStaticProps({ params });
					
					if (!('props' in getStaticPropsResult)) {
						return {}
					}
					
				  const ${propsParameterText} = getStaticPropsResult.props;
					
					return ${formatObjectAsString(metadataObject)};
					}	`,
	);
};

let addMetadataImport = (sourceFile: SourceFile) => {
	let importAlreadyExists = sourceFile
		.getImportDeclarations()
		.find((declaration) => {
			let specifier =
				declaration
					.getImportClause()
					?.getNamedImports()
					.find(
						(imp) => imp.getNameNode().getText() === 'Metadata',
					) ?? null;
			return (
				specifier !== null &&
				declaration.getModuleSpecifier().getText() === '"next"'
			);
		});

	if (!importAlreadyExists) {
		sourceFile.insertStatements(0, `import { Metadata } from "next";`);
	}
};
let insertMetadata = (
	sourceFile: SourceFile,
	metadataObject: Record<string, unknown>,
	param: (Dependency & { kind: SyntaxKind.Parameter }) | null,
) => {
	if (Object.keys(metadataObject).length === 0) {
		return undefined;
	}

	let positionBeforeComponent = getPositionBeforeComponent(sourceFile);

	if (param !== null) {
		insertGenerateMetadataFunctionDeclaration(
			sourceFile,
			metadataObject,
			param.text,
		);
	} else {
		sourceFile.insertStatements(
			positionBeforeComponent,
			buildMetadataStatement(metadataObject),
		);
	}

	addMetadataImport(sourceFile);
};

type PageComponent = ArrowFunction | FunctionExpression | FunctionDeclaration;

let getPageComponent = (sourceFile: SourceFile): PageComponent | null => {
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

	let pageComponent: PageComponent | null = null;

	declarations.forEach((d) => {
		if (Node.isVariableDeclaration(d)) {
			let initializer = d?.getInitializer();

			if (
				Node.isArrowFunction(initializer) ||
				Node.isFunctionExpression(initializer)
			) {
				pageComponent = initializer;
				return;
			}
		}

		if (Node.isFunctionDeclaration(d)) {
			pageComponent = d;
		}
	});

	return pageComponent ?? null;
};

let getPositionBeforeComponent = (sourceFile: SourceFile): number => {
	let component = getPageComponent(sourceFile);

	if (component === null) {
		return 0;
	}

	return Node.isFunctionDeclaration(component)
		? component.getChildIndex()
		: component
				.getFirstAncestorByKind(SyntaxKind.VariableStatement)
				?.getChildIndex() ?? 0;
};

let getPositionAfterImports = (sourceFile: SourceFile): number => {
	let lastImportDeclaration =
		sourceFile.getLastChildByKind(SyntaxKind.ImportDeclaration) ?? null;

	return (lastImportDeclaration?.getChildIndex() ?? 0) + 1;
};

let mergeOrCreateImports = (
	sourceFile: SourceFile,
	{
		moduleSpecifier,
		namedImports,
		defaultImport,
	}: ImportDeclarationStructure,
	path: string,
) => {
	let importDeclarations = sourceFile.getImportDeclarations();

	let importedModule =
		importDeclarations.find((importDeclaration) => {
			let oldPathRelative = importDeclaration
				.getModuleSpecifier()
				.getLiteralText();

			let oldPathAbsolute = resolveModuleName(oldPathRelative, path);

			let moduleIsLibOrUnresolved = oldPathAbsolute === null;
			return (
				oldPathAbsolute === moduleSpecifier ||
				(moduleIsLibOrUnresolved && oldPathRelative === moduleSpecifier)
			);
		}) ?? null;

	let pathIsAbsolute = isAbsolute(moduleSpecifier);

	// create import
	if (importedModule === null) {
		sourceFile.addImportDeclaration({
			defaultImport,
			namedImports,
			moduleSpecifier: pathIsAbsolute
				? relative(path, moduleSpecifier)
				: moduleSpecifier,
		});
		return;
	}

	if (!Array.isArray(namedImports)) {
		return;
	}

	namedImports.forEach((namedImport) => {
		let oldNamedImports = importedModule
			.getNamedImports()
			.map((i) => i.getText());

		let importName =
			typeof namedImport === 'string' ? namedImport : namedImport.name;

		if (!oldNamedImports.includes(importName)) {
			importedModule.addNamedImport(importName);
		}
	});
};

let insertDependencies = (
	sourceFile: SourceFile,
	dependencies: Record<string, Dependency>,
	path: string,
	usesDynamicMetadata: boolean,
) => {
	let positionAfterImports = getPositionAfterImports(sourceFile);

	Object.values(dependencies).forEach(({ kind, text, structure }) => {
		if (kind === SyntaxKind.Parameter) {
			return;
		}

		if (kind === SyntaxKind.ImportDeclaration && structure !== null) {
			mergeOrCreateImports(sourceFile, structure, path);
			positionAfterImports++;
			return;
		}

		if (usesDynamicMetadata) {
			let generateMetadataBody = sourceFile
				.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
				.find((f) => f.getName() === 'generateMetadata')
				?.getBody();

			if (Node.isBlock(generateMetadataBody)) {
				// position after
				// const { x } = getStaticPropsResult.props;
				// in generateMetadata function
				let POS_AFTER_PROPERTIES_ACCESS = 3;
				generateMetadataBody?.insertStatements(
					POS_AFTER_PROPERTIES_ACCESS,
					text,
				);
			}

			return;
		}

		sourceFile.insertStatements(positionAfterImports, text);
	});
};

// @TODO monorepo support
let getTsCompilerOptions = async (api: FileAPI, baseUrl: string) => {
	let tsConfigPath = join(baseUrl, 'tsconfig.json');

	try {
		let tsConfigStr = await api.readFile(tsConfigPath);
		let configWithoutComments = tsConfigStr.replace(/^\s*?\/\/.*$/gm, '');
		return JSON.parse(configWithoutComments).compilerOptions;
	} catch (e) {
		console.error(e);
		return {};
	}
};

export let repomod: Filemod<Dependencies, Record<string, unknown>> = {
	includePatterns: ['**/pages/**/*.{jsx,tsx,js,ts,cjs,ejs,mdx}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	handleFile: async (api, path, options) => {
		let { unifiedFileSystem } = api.getDependencies();
		let parsedPath = parse(path);

		let baseUrl = parsedPath.dir.split('pages')[0] ?? null;

		if (baseUrl === null) {
			return [];
		}

		let { paths } = await getTsCompilerOptions(api, baseUrl);

		if (projectContainer.get() === null) {
			await initTsMorphProject(
				api.getDependencies(),
				unifiedFileSystem,
				baseUrl,
				{
					paths,
				},
			);
		}

		let metadataTree = buildMetadataTreeNode(path, path);
		if (Object.keys(metadataTree).length === 0) {
			return [];
		}

		return [
			{
				kind: 'upsertFile',
				path,
				options: {
					...options,
					metadata: JSON.stringify(metadataTree),
				},
			},
		];
	},
	handleData: async (api, path, data, options) => {
		let { tsmorph } = api.getDependencies();

		let project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		let sourceFile = project.createSourceFile(path, data);

		try {
			let { metadata, dependencies } = JSON.parse(
				String(options.metadata ?? '{}'),
			);

			if (Object.entries(metadata ?? {}).length === 0) {
				return {
					kind: 'noop',
				};
			}

			// check if we have dependency on component arguments after merging metadata
			// if we have,it means that page probably gets props from data hooks
			let param =
				Object.values(dependencies).find(
					(d): d is Dependency & { kind: SyntaxKind.Parameter } =>
						// @ts-expect-error d is unknown
						d.kind === SyntaxKind.Parameter,
				) ?? null;

			insertMetadata(sourceFile, metadata, param);
			insertDependencies(sourceFile, dependencies, path, Boolean(param));

			return {
				kind: 'upsertData',
				path,
				data: sourceFile.getFullText(),
			};
		} catch (e) {
			console.error(e);
		}

		return {
			kind: 'noop',
		};
	},
};
