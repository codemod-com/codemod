import { isAbsolute, join, parse, relative } from "node:path";
import type { Filemod, UnifiedFileSystem } from "@codemod-com/filemod";
import type { fromMarkdown } from "mdast-util-from-markdown";
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
} from "ts-morph";
import tsmorph, { ModuleKind, Node, SyntaxKind } from "ts-morph";
import type { filter } from "unist-util-filter";
import type { visit } from "unist-util-visit";

/**
 * Copied from "../replace-next-head"
 */

type Dependency = {
	kind: SyntaxKind;
	text: string;
	structure: ImportDeclarationStructure | null;
	isBindingPattern?: boolean;
};

const openGraphWebsiteTags = [
	"og:type",
	"og:determiner",
	"og:title",
	"og:description",
	"og:url",
	"og:site_name",
	"og:locale",
	"og:locale:alternate",
	"og:country_name",
	"og:ttl",
	"og:image",
	"og:image:url",
	"og:image:width",
	"og:image:height",
	"og:image:alt",
	"og:audio",
	"og:audio:secure_url",
	"og:audio:type",
	"og:video",
	"og:video:secure_url",
	"og:video:type",
	"og:video:width",
	"og:video:height",
];

const openGraphArticleTags = [
	"article:published_time",
	"article:modified_time",
	"article:expiration_time",
	"article:author",
	"article:section",
	"article:tag",
];

const twitterTags = [
	"twitter:card",
	"twitter:site",
	"twitter:site:id",
	"twitter:creator",
	"twitter:creator:id",
	"twitter:title",
	"twitter:description",
];

// @TODO card=app
// @TODO card=player

// @TODO appLinks

const alternatesLinks = ["canonical", "alternate"];

const basicTags = [
	"title",
	"description",
	"application-name",
	"author",
	"manifest",
	"generator",
	"keywords",
	"referrer",
	"theme-color",
	"color-scheme",
	"viewport",
	"creator",
	"publisher",
	"robots",
	"abstract",
	"archives",
	"assets",
	"bookmarks",
	"category",
	"classification",
];

const iTunesMeta = ["apple-itunes-app"];
const formatDetectionTags = ["format-detection"];
// @TODO AppleWebAppMeta
const verificationTags = [
	"google-site-verification",
	"y_key",
	"yandex-verification",
];

const iconTags = ["icon", "apple-touch-icon", "shortcut icon", "mask-icon"];

const otherMetaTags = ["msapplication-TileColor", "msapplication-config"];

const knownNames = [
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

export const camelize = (str: string) =>
	str.replace(/[-_]([a-z])/g, (g) => (g[1] ?? "").toUpperCase());

export const buildContainer = <T>(initialValue: T) => {
	let currentValue: T = initialValue;

	const get = (): T => {
		return currentValue;
	};

	const set = (callback: (previousValue: T) => T): void => {
		currentValue = callback(currentValue);
	};

	return {
		get,
		set,
	};
};

type Container<T> = ReturnType<typeof buildContainer<T>>;

const getStructure = (node: Node) => {
	if (Node.isImportDeclaration(node)) {
		return node.getStructure();
	}

	return null;
};

const DEPENDENCY_TREE_MAX_DEPTH = 5;

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

const getDependenciesForIdentifiers = (
	identifiers: ReadonlyArray<Identifier>,
	depth = 0,
) => {
	if (depth > DEPENDENCY_TREE_MAX_DEPTH) {
		return {};
	}

	const dependencies: Record<string, Dependency> = {};

	identifiers.forEach((identifier) => {
		const parent = identifier.getParent();

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

		dependencies[identifier.getText()] = {
			text: ancestor.getText(),
			structure: getStructure(ancestor),
			kind: ancestor.getKind(),
			isBindingPattern:
				ancestor.getKind() === SyntaxKind.Parameter &&
				ancestor.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern) !==
					undefined,
		};

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

const handleJsxSelfClosingElement = (
	jsxSelfClosingElement: JsxSelfClosingElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	const tagName = jsxSelfClosingElement.getTagNameNode().getText();

	if (!["link", "meta"].includes(tagName)) {
		return;
	}

	const ancestorBinaryExpression = jsxSelfClosingElement.getFirstAncestorByKind(
		SyntaxKind.BinaryExpression,
	);

	const ancestorConditionalExpression =
		jsxSelfClosingElement.getFirstAncestorByKind(
			SyntaxKind.ConditionalExpression,
		);

	const binaryExpr = ancestorBinaryExpression?.getLeft();
	const conditionalExpr = ancestorConditionalExpression?.getCondition();

	const conditionExpr = binaryExpr ?? conditionalExpr;

	const identifiers =
		conditionExpr?.getDescendantsOfKind(SyntaxKind.Identifier) ?? [];

	const dependencies = getDependenciesForIdentifiers(identifiers);

	settingsContainer.set((prev) => ({
		...prev,
		dependencies: { ...prev.dependencies, ...dependencies },
	}));

	const metadataAttributes = jsxSelfClosingElement
		.getAttributes()
		.filter((attribute): attribute is JsxAttribute =>
			Node.isJsxAttribute(attribute),
		)
		.reduce<Record<string, string>>((metadataAttributes, attribute) => {
			const name = attribute.getNameNode().getText();
			const initializer = attribute.getInitializer();

			if (Node.isStringLiteral(initializer)) {
				metadataAttributes[name] = initializer.getFullText();
			}

			if (Node.isJsxExpression(initializer)) {
				const identifiers = initializer.getDescendantsOfKind(
					SyntaxKind.Identifier,
				);

				const dependencies = getDependenciesForIdentifiers(identifiers);

				settingsContainer.set((prev) => ({
					...prev,
					dependencies: { ...prev.dependencies, ...dependencies },
				}));

				metadataAttributes[name] = initializer.getExpression()?.getText() ?? "";
			}

			return metadataAttributes;
		}, {});

	const metadataName = (
		tagName === "link"
			? metadataAttributes.rel
			: metadataAttributes.name ?? metadataAttributes.property
	)?.replace(/\"/g, "");

	if (metadataName && knownNames.includes(metadataName)) {
		handleTag(
			{
				tagName,
				metadataName,
				metadataAttributes,
				conditionText: binaryExpr?.getText() ?? conditionalExpr?.getText(),
			},
			metadataContainer,
		);
	}
};

const handleHeadChildJsxElement = (
	jsxElement: JsxElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	if (jsxElement.getOpeningElement().getTagNameNode().getText() !== "title") {
		return;
	}

	const children = jsxElement.getJsxChildren();

	let text = "";

	const ancestorBinaryExpression = jsxElement.getFirstAncestorByKind(
		SyntaxKind.BinaryExpression,
	);

	const ancestorConditionalExpression = jsxElement.getFirstAncestorByKind(
		SyntaxKind.ConditionalExpression,
	);

	const binaryExpr = ancestorBinaryExpression?.getLeft();
	const conditionalExpr = ancestorConditionalExpression?.getCondition();

	const conditionExpr = binaryExpr ?? conditionalExpr;

	const identifiers =
		conditionExpr?.getDescendantsOfKind(SyntaxKind.Identifier) ?? [];
	const dependencies = getDependenciesForIdentifiers(identifiers);

	settingsContainer.set((prev) => ({
		...prev,
		dependencies: { ...prev.dependencies, ...dependencies },
	}));

	children.forEach((child) => {
		if (Node.isJsxText(child)) {
			text += child.getFullText();
		} else if (Node.isJsxExpression(child)) {
			const expression = child.getExpression();
			const identifiers = child.getDescendantsOfKind(SyntaxKind.Identifier);

			settingsContainer.set((prev) => ({
				...prev,
				dependencies: {
					...prev.dependencies,
					...getDependenciesForIdentifiers(identifiers),
				},
			}));

			if (Node.isTemplateExpression(expression)) {
				const t = expression.getFullText().replace(/\`/g, "");
				text += t;
				return;
			}

			const expressionText = expression?.getText() ?? null;

			if (expressionText === null) {
				return;
			}

			text += `\${${expressionText}}`;
		}
	});

	handleTag(
		{
			tagName: "title",
			metadataName: "title",
			metadataAttributes: {
				children: `\`${text}\``,
			},
			conditionText: binaryExpr?.getText() ?? conditionalExpr?.getText(),
		},
		metadataContainer,
	);
};

const handleHeadChild = (
	child: Node,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	if (Node.isJsxElement(child)) {
		handleHeadChildJsxElement(child, metadataContainer, settingsContainer);
	}

	if (Node.isJsxSelfClosingElement(child)) {
		handleJsxSelfClosingElement(child, metadataContainer, settingsContainer);
	}

	if (Node.isParenthesizedExpression(child)) {
		handleHeadChild(
			child.getExpression(),
			metadataContainer,
			settingsContainer,
		);
	}

	if (Node.isJsxExpression(child)) {
		const expression = child.getExpression();

		if (Node.isBinaryExpression(expression)) {
			handleHeadChild(
				expression.getRight(),
				metadataContainer,
				settingsContainer,
			);
		}

		if (Node.isConditionalExpression(expression)) {
			const whenTrue = expression.getWhenTrue();
			const whenFalse = expression.getWhenFalse();

			[whenTrue, whenFalse].forEach((expression) =>
				handleHeadChild(expression, metadataContainer, settingsContainer),
			);
		}
	}
};

const handleHeadJsxElement = (
	headJsxElement: JsxElement,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	const jsxChildren = headJsxElement.getJsxChildren();

	jsxChildren.forEach((child) => {
		handleHeadChild(child, metadataContainer, settingsContainer);
	});
};

const handleHeadIdentifier = (
	headIdentifier: Identifier,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	headIdentifier.findReferencesAsNodes().forEach((node) => {
		const parent = node.getParent();

		if (Node.isJsxOpeningElement(parent)) {
			const grandparent = parent.getParent();

			if (Node.isJsxElement(grandparent)) {
				handleHeadJsxElement(grandparent, metadataContainer, settingsContainer);
			}
		}
	});
};

export const handleImportDeclaration = (
	importDeclaration: ImportDeclaration,
	metadataContainer: Container<Record<string, any>>,
	settingsContainer: Container<Record<string, any>>,
) => {
	const moduleSpecifier = importDeclaration.getModuleSpecifier();

	if (moduleSpecifier.getLiteralText() !== "next/head") {
		return;
	}

	const headIdentifier = importDeclaration.getDefaultImport() ?? null;

	if (headIdentifier === null) {
		return;
	}

	handleHeadIdentifier(headIdentifier, metadataContainer, settingsContainer);
};

export const handleTag = (
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
	const metadataObject = metadataContainer.get();
	if (metadataName === "title") {
		metadataObject[metadataName] = metadataAttributes.children ?? "";
		metadataObject[`_CONDITION_TEXT_${metadataName}`] = conditionText;
	}

	if (tagName === "meta") {
		const content = metadataAttributes.content;

		if (otherMetaTags.includes(metadataName)) {
			if (!metadataObject.other) {
				metadataObject.other = {};
			}

			metadataObject.other[metadataName] = content;
			return;
		}

		if (metadataName.startsWith("article")) {
			const { content } = metadataAttributes;

			if (!metadataObject.openGraph) {
				metadataObject.openGraph = {};
			}

			if (metadataName === "article:author") {
				if (!metadataObject.openGraph.authors) {
					metadataObject.openGraph.authors = [];
				}

				metadataObject.openGraph.authors.push(content);

				return;
			}

			if (metadataName === "article:tag") {
				if (!metadataObject.openGraph.tags) {
					metadataObject.openGraph.tags = [];
				}

				metadataObject.openGraph.tags.push(content);

				return;
			}

			metadataObject.openGraph[camelize(metadataName.replace("article:", ""))] =
				content;

			return;
		}

		if (metadataName === "author") {
			if (!metadataObject.authors) {
				metadataObject.authors = [];
			}

			metadataObject["authors"].push({ name: content });
			return;
		}

		if (metadataName === "theme-color") {
			const { content, media } = metadataAttributes;

			if (!content && !media) {
				return;
			}

			if (!metadataObject.themeColor) {
				metadataObject.themeColor = [];
			}

			const themeColorObj = {
				...(media && { media }),
				...(content && { color: content }),
			};

			metadataObject.themeColor.push(themeColorObj);

			return;
		}

		if (metadataName === "googlebot") {
			return;
		}

		if (metadataName.startsWith("og:")) {
			const n = camelize(metadataName.replace("og:", ""));

			if (!metadataObject.openGraph) {
				metadataObject.openGraph = {};
			}

			// image structured property
			if (metadataName.startsWith("og:image")) {
				const { content } = metadataAttributes;

				if (!metadataObject.openGraph.images) {
					metadataObject.openGraph.images = [];
				}

				if (metadataName === "og:image:url" || metadataName === "og:image") {
					metadataObject.openGraph.images.push({
						url: content,
					});
				} else {
					const image = metadataObject.openGraph.images.at(-1);
					const propName = metadataName.replace("og:image:", "");

					image[propName] = content;
				}

				return;
			}

			if (metadataName.startsWith("og:audio")) {
				const { content } = metadataAttributes;

				if (!metadataObject.openGraph.audio) {
					metadataObject.openGraph.audio = [];
				}

				if (metadataName === "og:audio") {
					metadataObject.openGraph.audio.push({
						url: content,
					});
				} else {
					const audio = metadataObject.openGraph.audio.at(-1);
					const propName = metadataName.replace("og:audio:", "");

					audio[camelize(propName)] = content;
				}

				return;
			}

			if (metadataName.startsWith("og:video")) {
				const { content } = metadataAttributes;

				if (!metadataObject.openGraph.videos) {
					metadataObject.openGraph.videos = [];
				}

				if (metadataName === "og:video") {
					metadataObject.openGraph.videos.push({
						url: content,
					});
				} else {
					const video = metadataObject.openGraph.videos.at(-1);
					const propName = metadataName.replace("og:video:", "");

					video[camelize(propName)] = content;
				}

				return;
			}

			if (metadataName === "og:locale:alternate") {
				const { content } = metadataAttributes;

				if (!metadataObject.openGraph.alternateLocale) {
					metadataObject.openGraph.alternateLocale = [];
				}

				metadataObject.openGraph.alternateLocale.push(content);
				return;
			}

			metadataObject.openGraph[n] = content;
			return;
		}

		if (metadataName.startsWith("twitter:")) {
			const n = camelize(metadataName.replace("twitter:", ""));

			if (!metadataObject.twitter) {
				metadataObject.twitter = {};
			}

			if (metadataName === "twitter:site:id") {
				metadataObject.twitter.siteId = content;
				return;
			}

			if (metadataName === "twitter:creator:id") {
				metadataObject.twitter.creatorId = content;
				return;
			}

			metadataObject.twitter[n] = content;
			return;
		}

		const verification: Record<string, string> = {
			"google-site-verification": "google",
			"yandex-verification": "yandex",
			y_key: "yahoo",
		};

		if (Object.keys(verification).includes(metadataName)) {
			if (!metadataObject.verification) {
				metadataObject.verification = {};
			}

			const propName = verification[metadataName];

			if (!propName) {
				return;
			}

			metadataObject.verification[propName] = content;
			return;
		}

		if (metadataName === "format-detection") {
			return;
		}

		const propertyName = camelize(metadataName);
		metadataObject[propertyName] = content;
		metadataObject[`_CONDITION_TEXT_${metadataName}`] = conditionText;
	}

	if (tagName === "link") {
		const content = metadataAttributes.href;

		if (metadataName === "author") {
			if (metadataObject.authors.length === 0) {
				return;
			}

			metadataObject.authors[metadataObject.authors.length - 1].url = content;

			return;
		}

		if (["archives", "assets", "bookmarks"].includes(metadataName)) {
			if (!metadataObject[metadataName]) {
				metadataObject[metadataName] = [];
			}

			metadataObject[metadataName].push(content);

			return;
		}

		if (["canonical", "alternate"].includes(metadataName)) {
			if (!metadataObject.alternates) {
				metadataObject.alternates = {};
			}

			if (metadataName === "canonical") {
				metadataObject.alternates[metadataName] = content;
			}

			const { hreflang, media, type, href } = metadataAttributes;

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

		const otherIcons = ["mask-icon"];

		const icons: Record<string, string> = {
			"shortcut icon": "shortcut",
			icon: "icon",
			"apple-touch-icon": "apple",
			"mask-icon": "other",
			...Object.fromEntries(
				otherIcons.map((otherIcon) => [otherIcon, "other"]),
			),
		};

		if (Object.keys(icons).includes(metadataName)) {
			const iconTypeName = icons[metadataName];
			const { sizes, type, href, rel } = metadataAttributes;

			if (!iconTypeName) {
				return;
			}

			if (!metadataObject.icons) {
				metadataObject.icons = {};
			}

			if (!metadataObject.icons[iconTypeName]) {
				metadataObject.icons[iconTypeName] = [];
			}

			const shouldIncludeRel = otherIcons.includes(metadataName);

			const iconMetadataObject = {
				...(sizes && { sizes }),
				...(type && { type }),
				...(href && { url: href }),
				...(shouldIncludeRel && rel && { rel }),
			};

			metadataObject.icons[iconTypeName].push(iconMetadataObject);
			return;
		}

		if (metadataName.startsWith("al:")) {
			return;
		}

		const propertyName = camelize(metadataName);
		metadataObject[propertyName] = content;
	}

	metadataContainer.set(() => metadataObject);
};

const isValidIdentifier = (identifierName: string): boolean => {
	if (identifierName.length === 0) {
		return false;
	}

	if (!/[a-zA-Z_]/.test(identifierName.charAt(0))) {
		return false;
	}

	const validChars = /^[a-zA-Z0-9_]*$/;
	return validChars.test(identifierName);
};

const isDoubleQuotified = (str: string) =>
	str.startsWith('"') && str.endsWith('"');

function formatObjectAsString(metadataObject: Record<string, any>) {
	const pairs: string[] = [];

	for (const [key, value] of Object.entries(metadataObject)) {
		if (key.startsWith("_")) {
			continue;
		}

		const conditionText = metadataObject[`_CONDITION_TEXT_${key}`];

		if (Array.isArray(value)) {
			const formattedArray = value.map((element) =>
				typeof element === "object" && element !== null
					? formatObjectAsString(element)
					: String(element),
			);

			const pair = `${key}: [${formattedArray.join(", \n")}]`;
			const pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		} else if (typeof value === "object" && value !== null) {
			const pair = `${key}: ${formatObjectAsString(value)}`;
			const pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		} else {
			const keyIsValidIdentifier = isValidIdentifier(key);
			const keyDoubleQuotified = isDoubleQuotified(key);

			const pair = `${
				!keyIsValidIdentifier && !keyDoubleQuotified ? `"${key}"` : key
			}: ${value}`;
			const pairText = conditionText
				? `...(${conditionText} && {${pair} })`
				: pair;
			pairs.push(pairText);
		}
	}

	return `{ \n ${pairs.join(", \n")} \n }`;
}

const buildMetadataStatement = (metadataObject: Record<string, unknown>) => {
	return `export const metadata: Metadata = ${formatObjectAsString(
		metadataObject,
	)}`;
};

type Root = ReturnType<typeof fromMarkdown>;

// eslint-disable-next-line @typescript-eslint/ban-types
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
	NonNullable<Filemod<Dependencies, State>["handleFile"]>
>[0];

export const projectContainer = buildContainer<tsmorph.Project | null>(null);
export const subTreeCacheContainer = buildContainer<
	Map<string, MetadataTreeNode>
>(new Map());

const defaultCompilerOptions = {
	allowJs: true,
	module: ModuleKind.CommonJS,
	traceResolution: true,
};

export const buildComponentMetadata = (
	sourceFile: SourceFile,
): {
	metadata: Record<string, unknown>;
	dependencies: Record<string, Dependency>;
} => {
	const metadataContainer = buildContainer<Record<string, any>>({});
	const settingsContainer = buildContainer<Record<string, any>>({});

	const importDeclarations = sourceFile.getImportDeclarations();

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

const removeMdxNodes = (
	{ visitMdxAst, filterMdxAst, stringifyMdx, parseMdx }: Dependencies,
	content: string,
): string => {
	if (!filterMdxAst || !visitMdxAst || !stringifyMdx || !parseMdx) {
		return content;
	}

	try {
		const tree = parseMdx(content);

		const newTree = filterMdxAst(tree, (node) => {
			return ["root", "mdxJsxFlowElement", "mdxjsEsm"].includes(node.type);
		});

		if (newTree === undefined) {
			return content;
		}

		const mdxJsxFlowElements: string[] = [];

		visitMdxAst(newTree, (node) => {
			if (node.type === "mdxJsxFlowElement") {
				// @ts-expect-error stringify any node
				const value = stringifyMdx(node);
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

const initTsMorphProject = async (
	dependencies: Dependencies,
	unifiedFileSystem: Dependencies["unifiedFileSystem"],
	rootPath: string,
	compilerOptions?: tsmorph.CompilerOptions,
) => {
	const { tsmorph } = dependencies;

	const project = new tsmorph.Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			...defaultCompilerOptions,
			...compilerOptions,
			baseUrl: rootPath,
		},
	});

	const allFilePaths = await unifiedFileSystem.getFilePaths(
		rootPath,
		["**/*.{jsx,tsx,ts,js,cjs,ejs,mdx}"],
		["**/node_modules/**"],
	);

	for (const path of allFilePaths) {
		const content = await unifiedFileSystem.readFile(path);
		if (path.endsWith(".mdx")) {
			const contentWithoutMdxNodes = removeMdxNodes(dependencies, content);

			project.createSourceFile(
				path.replace(".mdx", ".tsx"),
				contentWithoutMdxNodes,
			);
			continue;
		}

		project.createSourceFile(path, content);
	}

	projectContainer.set(() => project);
};

const resolveModuleName = (path: string, containingPath: string) => {
	const project = projectContainer.get();

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

const getComponentPaths = (sourceFile: SourceFile) => {
	const paths = sourceFile
		.getDescendants()
		.filter(
			(d): d is JsxOpeningElement | JsxSelfClosingElement =>
				Node.isJsxOpeningElement(d) || Node.isJsxSelfClosingElement(d),
		)
		.map((componentTag) => {
			const nameNode = componentTag.getTagNameNode();
			const declaration = nameNode.getSymbol()?.getDeclarations()[0];

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

const mapRelativeToAbsolutePaths = (
	dependencies: Record<string, Dependency>,
	containingPath: string,
): Record<string, Dependency> =>
	Object.entries(dependencies).reduce<Record<string, Dependency>>(
		(acc, [key, val]) => {
			if (val.kind === SyntaxKind.ImportDeclaration && val.structure !== null) {
				const resolvedModuleName =
					resolveModuleName(
						val.structure.moduleSpecifier ?? "",
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

const mergeNodes = (
	parent: MetadataTreeNode,
	child: MetadataTreeNode,
	pagePath: string,
) => {
	const componentPropsValues = findComponentPropValue(parent.path, child.path);

	const nextDependencies = Object.entries(child.dependencies).reduce(
		(acc, [identifierName, value]) => {
			if (value.kind === SyntaxKind.Parameter) {
				const propValue = componentPropsValues[identifierName] ?? null;

				// handle props object
				if (!value.isBindingPattern) {
					const propsObjectText = Object.entries(componentPropsValues).reduce<
						Record<string, string>
					>((acc, [key, value]) => {
						acc[key] = Node.isJsxExpression(value)
							? value.getExpression()?.getText() ?? ""
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

					const identifiers: Identifier[] = [];

					Object.values(componentPropsValues).forEach((propValue) => {
						identifiers.push(
							...propValue.getDescendantsOfKind(SyntaxKind.Identifier),
						);
					});

					const newDependencies = getDependenciesForIdentifiers(identifiers);

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

				const identifiers = propValue.getDescendantsOfKind(
					SyntaxKind.Identifier,
				);

				const newDependencies = getDependenciesForIdentifiers(identifiers);

				//add dependencies of propValue
				Object.entries(newDependencies).forEach(([identifier, dependency]) => {
					if (
						pagePath === parent.path &&
						dependency.kind !== SyntaxKind.Parameter
					) {
						return;
					}

					acc[identifier] = dependency;
				});

				// add propValue declaration

				const propValueText = Node.isJsxExpression(propValue)
					? propValue.getExpression()?.getText() ?? ""
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

const buildMetadataTreeNode = (containingPath: string, pagePath: string) => {
	const subTreeCache = subTreeCacheContainer.get();
	const cachedTreeNode = subTreeCache.get(containingPath);

	if (cachedTreeNode !== undefined) {
		return cachedTreeNode;
	}

	const treeNode: MetadataTreeNode = {
		path: containingPath,
		components: {},
		metadata: {},
		dependencies: {},
	};

	const project = projectContainer.get();

	const sourceFile =
		project?.getSourceFile(containingPath.replace(".mdx", ".tsx")) ?? null;

	if (sourceFile === null) {
		return treeNode;
	}

	const { metadata, dependencies } = buildComponentMetadata(sourceFile);

	treeNode.metadata = metadata;
	treeNode.dependencies = mapRelativeToAbsolutePaths(
		dependencies ?? {},
		containingPath,
	);

	getComponentPaths(sourceFile).forEach((path) => {
		const resolvedFileName = resolveModuleName(path, containingPath);

		if (resolvedFileName === null) {
			return;
		}

		const childTreeNode = buildMetadataTreeNode(resolvedFileName, pagePath);

		treeNode.components[resolvedFileName] = childTreeNode;

		mergeNodes(treeNode, childTreeNode, pagePath);

		// cache
		subTreeCacheContainer.set((map) => map.set(treeNode.path, treeNode));
	});

	return treeNode;
};

const findComponentByModuleSpecifier = (
	sourceFile: SourceFile,
	componentAbsolutePath: string,
) => {
	return (
		sourceFile
			.getDescendants()
			.find((d): d is JsxOpeningElement | JsxSelfClosingElement => {
				if (!Node.isJsxOpeningElement(d) && !Node.isJsxSelfClosingElement(d)) {
					return false;
				}

				const nameNode = d.getTagNameNode();
				const declaration = nameNode.getSymbol()?.getDeclarations()[0];

				const moduleSpecifier = declaration
					?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
					?.getModuleSpecifier()
					.getLiteralText();

				const absolutePath = resolveModuleName(
					moduleSpecifier ?? "",
					sourceFile.getFilePath().toString(),
				);

				return absolutePath === componentAbsolutePath;
			}) ?? null
	);
};

const findComponentPropValue = (
	path: string,
	componentPath: string,
): Record<string, JsxExpression | StringLiteral> => {
	const project = projectContainer.get();

	const sourceFile =
		project?.getSourceFile(path.replace(".mdx", ".tsx")) ?? null;

	if (sourceFile === null) {
		return {};
	}

	const component = findComponentByModuleSpecifier(sourceFile, componentPath);
	const propValue: Record<string, JsxExpression | StringLiteral> = {};

	const jsxAttributes =
		component?.getDescendantsOfKind(SyntaxKind.JsxAttribute) ?? [];

	jsxAttributes.forEach((jsxAttribute) => {
		const name = jsxAttribute.getNameNode().getText();

		const initializer = jsxAttribute.getInitializer();
		if (
			Node.isJsxExpression(initializer) ||
			Node.isStringLiteral(initializer)
		) {
			propValue[name] = initializer;
		}
	});

	return propValue;
};

const insertGenerateMetadataFunctionDeclaration = (
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

const addMetadataImport = (sourceFile: SourceFile) => {
	const importAlreadyExists = sourceFile
		.getImportDeclarations()
		.find((declaration) => {
			const specifier =
				declaration
					.getImportClause()
					?.getNamedImports()
					.find((imp) => imp.getNameNode().getText() === "Metadata") ?? null;
			return (
				specifier !== null &&
				declaration.getModuleSpecifier().getText() === '"next"'
			);
		});

	if (!importAlreadyExists) {
		sourceFile.insertStatements(0, `import { Metadata } from "next";`);
	}
};
const insertMetadata = (
	sourceFile: SourceFile,
	metadataObject: Record<string, unknown>,
	param: (Dependency & { kind: SyntaxKind.Parameter }) | null,
) => {
	if (Object.keys(metadataObject).length === 0) {
		return undefined;
	}

	const positionBeforeComponent = getPositionBeforeComponent(sourceFile);

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

const getPageComponent = (sourceFile: SourceFile): PageComponent | null => {
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

	let pageComponent: PageComponent | null = null;

	declarations.forEach((d) => {
		if (Node.isVariableDeclaration(d)) {
			const initializer = d?.getInitializer();

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

const getPositionBeforeComponent = (sourceFile: SourceFile): number => {
	const component = getPageComponent(sourceFile);

	if (component === null) {
		return 0;
	}

	return Node.isFunctionDeclaration(component)
		? component.getChildIndex()
		: component
				.getFirstAncestorByKind(SyntaxKind.VariableStatement)
				?.getChildIndex() ?? 0;
};

const getPositionAfterImports = (sourceFile: SourceFile): number => {
	const lastImportDeclaration =
		sourceFile.getLastChildByKind(SyntaxKind.ImportDeclaration) ?? null;

	return (lastImportDeclaration?.getChildIndex() ?? 0) + 1;
};

const mergeOrCreateImports = (
	sourceFile: SourceFile,
	{ moduleSpecifier, namedImports, defaultImport }: ImportDeclarationStructure,
	path: string,
) => {
	const importDeclarations = sourceFile.getImportDeclarations();

	const importedModule =
		importDeclarations.find((importDeclaration) => {
			const oldPathRelative = importDeclaration
				.getModuleSpecifier()
				.getLiteralText();

			const oldPathAbsolute = resolveModuleName(oldPathRelative, path);

			const moduleIsLibOrUnresolved = oldPathAbsolute === null;
			return (
				oldPathAbsolute === moduleSpecifier ||
				(moduleIsLibOrUnresolved && oldPathRelative === moduleSpecifier)
			);
		}) ?? null;

	const pathIsAbsolute = isAbsolute(moduleSpecifier);

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
		const oldNamedImports = importedModule
			.getNamedImports()
			.map((i) => i.getText());

		const importName =
			typeof namedImport === "string" ? namedImport : namedImport.name;

		if (!oldNamedImports.includes(importName)) {
			importedModule.addNamedImport(importName);
		}
	});
};

const insertDependencies = (
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
			const generateMetadataBody = sourceFile
				.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
				.find((f) => f.getName() === "generateMetadata")
				?.getBody();

			if (Node.isBlock(generateMetadataBody)) {
				// position after
				// const { x } = getStaticPropsResult.props;
				// in generateMetadata function
				const POS_AFTER_PROPERTIES_ACCESS = 3;
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
const getTsCompilerOptions = async (api: FileAPI, baseUrl: string) => {
	const tsConfigPath = join(baseUrl, "tsconfig.json");

	try {
		const tsConfigStr = await api.readFile(tsConfigPath);
		const configWithoutComments = tsConfigStr.replace(/^\s*?\/\/.*$/gm, "");
		return JSON.parse(configWithoutComments).compilerOptions;
	} catch (e) {
		console.error(e);
		return {};
	}
};

export const repomod: Filemod<Dependencies, Record<string, unknown>> = {
	includePatterns: ["**/pages/**/*.{jsx,tsx,js,ts,cjs,ejs,mdx}"],
	excludePatterns: ["**/node_modules/**", "**/pages/api/**"],
	handleFile: async (api, path, options) => {
		const { unifiedFileSystem } = api.getDependencies();
		const parsedPath = parse(path);

		const baseUrl = parsedPath.dir.split("pages")[0] ?? null;

		if (baseUrl === null) {
			return [];
		}

		const { paths } = await getTsCompilerOptions(api, baseUrl);

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

		const metadataTree = buildMetadataTreeNode(path, path);
		if (Object.keys(metadataTree).length === 0) {
			return [];
		}

		return [
			{
				kind: "upsertFile",
				path,
				options: {
					...options,
					metadata: JSON.stringify(metadataTree),
				},
			},
		];
	},
	handleData: async (api, path, data, options) => {
		const { tsmorph } = api.getDependencies();

		const project = new tsmorph.Project({
			useInMemoryFileSystem: true,
			skipFileDependencyResolution: true,
			compilerOptions: {
				allowJs: true,
			},
		});

		const sourceFile = project.createSourceFile(path, data);

		try {
			const { metadata, dependencies } = JSON.parse(
				String(options.metadata ?? "{}"),
			);

			if (Object.entries(metadata ?? {}).length === 0) {
				return {
					kind: "noop",
				};
			}

			// check if we have dependency on component arguments after merging metadata
			// if we have,it means that page probably gets props from data hooks
			const param =
				Object.values(dependencies).find(
					(d): d is Dependency & { kind: SyntaxKind.Parameter } =>
						// @ts-expect-error d is unknown
						d.kind === SyntaxKind.Parameter,
				) ?? null;

			insertMetadata(sourceFile, metadata, param);
			insertDependencies(sourceFile, dependencies, path, Boolean(param));

			return {
				kind: "upsertData",
				path,
				data: sourceFile.getFullText(),
			};
		} catch (e) {
			console.error(e);
		}

		return {
			kind: "noop",
		};
	},
};
