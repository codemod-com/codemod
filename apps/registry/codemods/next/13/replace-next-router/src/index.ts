import type {
	BindingElement,
	CallExpression,
	Identifier,
	ImportDeclaration,
	ImportSpecifier,
	PropertyAccessExpression,
	SourceFile,
	VariableDeclaration,
} from 'ts-morph';
import { Node, ts } from 'ts-morph';

// how to fix router events (manually)
// https://nextjs.org/docs/app/api-reference/functions/use-router#router-events

class FileLevelUsageManager {
	private __pathnameUsed: boolean = false;
	private __routerUsed: boolean = false;
	private __searchParamsUsed: boolean = false;
	private __paramsUsed: boolean = false;
	public useCallbackUsed: boolean = false;
	public useMemoUsed: boolean = false;

	private __useRouterPresent: boolean;
	private __nextRouterPresent: boolean;
	private __useSearchParamsPresent: boolean;
	private __useParamsPresent: boolean;
	private __usePathnamePresent: boolean;

	public constructor(
		importDeclarations: ReadonlyArray<ImportDeclaration>,
		public readonly dynamicSegments: ReadonlyArray<string>,
	) {
		this.__useRouterPresent = hasImport(
			importDeclarations,
			'next/router',
			'useRouter',
		);

		this.__nextRouterPresent = hasImport(
			importDeclarations,
			'next/router',
			'NextRouter',
		);

		this.__useSearchParamsPresent = hasImport(
			importDeclarations,
			'next/navigation',
			'useSearchParams',
		);

		this.__useParamsPresent = hasImport(
			importDeclarations,
			'next/navigation',
			'useParams',
		);

		this.__usePathnamePresent = hasImport(
			importDeclarations,
			'next/navigation',
			'usePathname',
		);
	}

	public reportPathnameUsed() {
		this.__pathnameUsed = true;
	}

	public reportRouterUsed() {
		this.__routerUsed = true;
	}

	public reportSearchParamsUsed() {
		this.__searchParamsUsed = true;
	}

	public reportParamsUsed() {
		this.__paramsUsed = true;
	}

	public hasAnyNextRouterImport() {
		return this.__useRouterPresent || this.__nextRouterPresent;
	}

	public shouldImportUseRouter(): boolean {
		return this.__routerUsed;
	}

	public shouldImportUseSearchParams(): boolean {
		return this.__searchParamsUsed && !this.__useSearchParamsPresent;
	}

	public shouldImportUseParams(): boolean {
		return this.__paramsUsed && !this.__useParamsPresent;
	}

	public shouldImportUsePathname(): boolean {
		return this.__pathnameUsed && !this.__usePathnamePresent;
	}

	public shouldImportAppRouterInstance(): boolean {
		return this.__nextRouterPresent;
	}
}

type Param = Readonly<{ propertyName: string; name: string }>;

class BlockLevelUsageManager {
	private __getParamUsed: boolean = false;

	private __paramsUsed: boolean = false;
	private __searchParamsUsed: boolean = false;
	private __paramMapUsed: boolean = false;

	private __routerUsed: boolean = false;

	private __pathnames: Set<string> = new Set();
	private __asPaths: Set<string> = new Set();
	private __paramsForUseParams: Array<Param> = [];
	private __paramsForGetParam: Array<Param> = [];

	public constructor(
		private readonly __paramsIdentifierNameUsed: boolean,
		private readonly __pathnameIdentifierNameUsed: boolean,
		private readonly __searchParamsIdentifierNameUsed: boolean,
		private readonly __dynamicSegments: ReadonlyArray<string>,
	) {}

	public isRouterUsed(): boolean {
		return this.__routerUsed;
	}

	public getParamsIdentifierName(): string | null {
		if (!this.__paramsUsed) {
			return null;
		}

		return this.__paramsIdentifierNameUsed ? '__params__' : 'params';
	}

	public getSearchParamsIdentifierName(): string | null {
		if (!this.__searchParamsUsed) {
			return null;
		}

		return this.__searchParamsIdentifierNameUsed
			? '__searchParams__'
			: 'searchParams';
	}

	public isGetParamsUsed(): boolean {
		return this.__getParamUsed;
	}

	public getAsPath(): ReadonlySet<string> {
		return this.__asPaths;
	}

	public getPathnames(): ReadonlySet<string> {
		return this.__pathnames;
	}

	public getParamsForGetParam(): ReadonlyArray<Param> {
		return this.__paramsForGetParam;
	}

	public getParamsForUseParams(): ReadonlyArray<Param> {
		return this.__paramsForUseParams;
	}

	public getParamMap(): boolean {
		return this.__paramMapUsed;
	}

	public addPathname(pathname: string): void {
		this.__pathnames.add(pathname);
	}

	public addParam(param: Param): void {
		if (this.__dynamicSegments.includes(param.propertyName)) {
			this.__paramsForUseParams.push(param);

			this.reportParamUsage();

			return;
		}

		this.__paramsForGetParam.push(param);

		this.reportGetParamUsage();
	}

	public reportAsPathUsage(asPath: string): void {
		this.__pathnames.add(
			this.__pathnameIdentifierNameUsed ? '__pathname__' : 'pathname',
		);

		this.__searchParamsUsed = true;
		this.__asPaths.add(asPath);
	}

	public reportParamUsage(): void {
		this.__paramsUsed = true;
	}

	public reportGetParamUsage(): void {
		this.__paramsUsed = true;
		this.__searchParamsUsed = true;
		this.__getParamUsed = true;
	}

	public reportSearchParamsUsage(): void {
		this.__searchParamsUsed = true;
	}

	public reportRouterUsage(): void {
		this.__routerUsed = true;
	}

	public reportParamMapUsage(): void {
		this.__paramsUsed = true;
		this.__searchParamsUsed = true;
		this.__paramMapUsed = true;
	}
}

const buildParam = (bindingElement: BindingElement): Param => {
	const name = bindingElement.getName();

	const propertyName =
		bindingElement.getPropertyNameNode()?.getText() ?? name;

	return {
		name,
		propertyName,
	};
};

const hasImport = (
	importDeclarations: readonly ImportDeclaration[],
	moduleSpecifierText: string,
	namedImportText: string,
): boolean => {
	return importDeclarations.some((importDeclaration) => {
		const moduleSpecifier = importDeclaration.getModuleSpecifier();

		if (moduleSpecifier.getLiteralText() !== moduleSpecifierText) {
			return false;
		}

		return importDeclaration
			.getNamedImports()
			.some((namedImport) => namedImport.getName() === namedImportText);
	});
};

const handlePushCallExpression = (node: CallExpression) => {
	const grandParentNode = node.getParent();
	const arg = node.getArguments()[0];

	if (Node.isStringLiteral(arg)) {
		// remove `await` if it exists
		if (Node.isAwaitExpression(grandParentNode)) {
			const text = grandParentNode.getText();
			grandParentNode.replaceWithText(text.replace('await', ''));
		}
		// arg is already string. no further action required.
		return;
	}
	if (!Node.isObjectLiteralExpression(arg)) {
		return;
	}

	const pathnameNode = arg.getProperty('pathname');

	if (
		!Node.isPropertyAssignment(pathnameNode) // `pathname` is required
	) {
		return;
	}

	const pathNameValue = pathnameNode.getInitializer()?.getText() ?? '';
	const queryNode = arg.getProperty('query');

	let newText = ``;
	let newArgText = ``;
	if (Node.isPropertyAssignment(queryNode)) {
		newText += `const urlSearchParams = new URLSearchParams();\n`;

		const initializer = queryNode.getInitializer();
		if (Node.isObjectLiteralExpression(initializer)) {
			const properties = initializer.getProperties();

			properties.forEach((property) => {
				if (Node.isPropertyAssignment(property)) {
					const name = property.getNameNode();
					const initializer = property.getInitializer();
					newText += `\n urlSearchParams.set('${name.getText()}', ${initializer?.getText()});`;
				}
			});

			newArgText = `\`${pathNameValue.replace(
				/("|')/g,
				'',
			)}?\${urlSearchParams.toString()}\``;
		}
	} else {
		newArgText = pathNameValue;
	}

	arg.replaceWithText(newArgText);

	if (Node.isArrowFunction(grandParentNode)) {
		const body = grandParentNode.getBody();

		if (Node.isCallExpression(body)) {
			body.replaceWithText(`{\n ${newText}\nreturn ${body.getText()}\n}`);
		}
	}

	if (Node.isExpressionStatement(grandParentNode)) {
		const block = node.getFirstAncestorByKind(ts.SyntaxKind.Block);
		const prevSiblingNodeCount = node.getPreviousSiblings().length;
		block?.insertStatements(prevSiblingNodeCount, newText);
	}
};

// e.g. router.query
const handleRouterPropertyAccessExpression = (
	blockLevelUsageManager: BlockLevelUsageManager,
	node: PropertyAccessExpression,
) => {
	const nodeName = node.getName();

	if (nodeName === 'query') {
		let parentNode = node.getParent();

		if (Node.isAsExpression(parentNode)) {
			parentNode = parentNode.getParent();
		}

		if (Node.isPropertyAccessExpression(parentNode)) {
			// e.g. router.query.a
			const parentNodeName = parentNode.getName();

			parentNode.replaceWithText(`getParam("${parentNodeName}")`);

			blockLevelUsageManager.reportGetParamUsage();
		} else if (Node.isSpreadAssignment(parentNode)) {
			parentNode.replaceWithText(
				`...Object.fromEntries(searchParams ?? new URLSearchParams())`,
			);

			blockLevelUsageManager.reportSearchParamsUsage();
		} else if (Node.isVariableDeclaration(parentNode)) {
			const variableDeclarationName = parentNode.getNameNode();

			if (Node.isObjectBindingPattern(variableDeclarationName)) {
				const elements = variableDeclarationName.getElements();

				const dotDotDotTokenPresent = elements.some(
					(element) => element.getDotDotDotToken() !== undefined,
				);

				if (!dotDotDotTokenPresent) {
					for (const bindingElement of elements) {
						blockLevelUsageManager.addParam(
							buildParam(bindingElement),
						);
					}
				} else {
					const bindingPatternText =
						variableDeclarationName.getText();
					const vdl = parentNode.getFirstAncestorByKind(
						ts.SyntaxKind.VariableDeclarationList,
					);
					vdl?.addDeclaration({
						name: bindingPatternText,
						initializer: `Object.fromEntries(searchParams?.entries() ?? [])`,
					});
				}

				parentNode.remove();

				blockLevelUsageManager.reportSearchParamsUsage();
			}
		} else if (Node.isCallExpression(parentNode)) {
			const expression = parentNode.getExpression();

			if (Node.isPropertyAccessExpression(expression)) {
				const leftSideExpression = expression.getExpression();
				const rightSideExpression = expression.getName();

				if (Node.isIdentifier(leftSideExpression)) {
					if (
						leftSideExpression.getText() === 'Object' &&
						rightSideExpression === 'entries'
					) {
						parentNode.replaceWithText('Array.from(paramMap)');
						blockLevelUsageManager.reportParamMapUsage();

						return;
					}
				}
			}

			node.replaceWithText(
				'...Object.fromEntries(searchParams ?? new URLSearchParams())',
			);
			blockLevelUsageManager.reportSearchParamsUsage();
		} else if (Node.isElementAccessExpression(parentNode)) {
			// e.g. router.query["param"]

			const argumentExpressionAsText = parentNode
				.getArgumentExpression()
				?.getText();

			if (!argumentExpressionAsText) {
				return;
			}

			const replacerText = `getParam(${argumentExpressionAsText})`;

			parentNode.replaceWithText(replacerText);

			blockLevelUsageManager.reportGetParamUsage();
		} else {
			node.replaceWithText('searchParams');
			blockLevelUsageManager.reportSearchParamsUsage();
		}
	} else if (nodeName === 'pathname') {
		const parentNode = node.getParent();

		if (Node.isVariableDeclaration(parentNode)) {
			parentNode.remove();
		} else if (Node.isPropertyAccessExpression(parentNode)) {
			const rightNode = parentNode.getName();

			parentNode.replaceWithText(`pathname?.${rightNode}`);
		} else {
			node.replaceWithText('pathname');
		}

		blockLevelUsageManager.addPathname('pathname');
	} else if (nodeName === 'isReady') {
		blockLevelUsageManager.reportSearchParamsUsage();

		try {
			// replacing `router.isReady`
			node.replaceWithText('searchParams !== null');
		} catch (_err) {
			// replacing `!router.isReady`
			const parentNode = node.getParent();
			const grandParentNode = parentNode?.getParent() ?? null;
			if (grandParentNode === null) {
				return;
			}

			if (Node.isVariableDeclaration(grandParentNode)) {
				// replacing `const var = !router.isReady`
				const initializer = grandParentNode.getInitializer();
				if (
					Node.isPrefixUnaryExpression(initializer) &&
					initializer.getOperatorToken() ===
						ts.SyntaxKind.ExclamationToken
				) {
					initializer.replaceWithText('searchParams === null');
				}
			} else if (Node.isIfStatement(grandParentNode)) {
				// replacing `if (!router.isReady)`
				const condition = grandParentNode.getExpression();

				if (
					Node.isPrefixUnaryExpression(condition) &&
					condition.getOperatorToken() ===
						ts.SyntaxKind.ExclamationToken
				) {
					condition.replaceWithText('searchParams === null');
				}
			} else if (Node.isConditionalExpression(grandParentNode)) {
				// replacing `if (!router.isReady)`

				const condition = grandParentNode.getCondition();

				if (
					Node.isPrefixUnaryExpression(condition) &&
					condition.getOperatorToken() ===
						ts.SyntaxKind.ExclamationToken
				) {
					const operand = condition.getOperand();
					if (
						Node.isPropertyAccessExpression(operand) &&
						operand.getText() === 'router.isReady'
					) {
						condition.replaceWithText('searchParams === null');
					}
				}
			}
		}
	} else if (nodeName === 'asPath') {
		const parentNode = node.getParent();

		if (Node.isPropertyAccessExpression(parentNode)) {
			const rightNode = parentNode.getName();

			parentNode.replaceWithText(`${nodeName}.${rightNode}`);
		} else {
			node.replaceWithText(nodeName);
		}

		blockLevelUsageManager.reportAsPathUsage(nodeName);
	} else if (nodeName === 'href') {
		node.replaceWithText('pathname');

		blockLevelUsageManager.addPathname('pathname');
	} else if (nodeName === 'isFallback') {
		node.replaceWithText('false');
	} else if (nodeName === 'replace' || nodeName === 'push') {
		blockLevelUsageManager.reportRouterUsage();

		const parentNode = node.getParent();

		if (Node.isCallExpression(parentNode)) {
			handlePushCallExpression(parentNode);
		}
	} else {
		// unrecognized node names
		blockLevelUsageManager.reportRouterUsage();
	}
};

const handleQueryIdentifierNode = (
	node: Identifier,
	blockLevelUsageManager: BlockLevelUsageManager,
) => {
	const parent = node.getParent();

	if (Node.isPropertyAccessExpression(parent)) {
		const name = parent.getName();

		parent.replaceWithText(`getParam('${name}')`);

		blockLevelUsageManager.reportGetParamUsage();
	} else if (Node.isVariableDeclaration(parent)) {
		const variableDeclaration = parent;

		const nameNode = variableDeclaration.getNameNode();

		if (Node.isObjectBindingPattern(nameNode)) {
			for (const bindingElement of nameNode.getElements()) {
				blockLevelUsageManager.addParam(buildParam(bindingElement));
			}

			variableDeclaration.remove();
		}
	} else if (Node.isCallExpression(parent)) {
		node.replaceWithText('searchParams');

		blockLevelUsageManager.reportSearchParamsUsage();
	} else if (Node.isElementAccessExpression(parent)) {
		const expression = parent.getArgumentExpression();

		if (Node.isStringLiteral(expression)) {
			parent.replaceWithText(`getParam(${expression.getText()})`);

			blockLevelUsageManager.reportGetParamUsage();
		}
	}
};

const handleVariableDeclarationWithRouter = (
	variableDeclaration: VariableDeclaration,
	blockLevelUsageManager: BlockLevelUsageManager,
) => {
	const nameNode = variableDeclaration.getNameNode();

	if (Node.isObjectBindingPattern(nameNode)) {
		const elements = nameNode.getElements();
		let count = 0;

		for (const element of elements) {
			const nameNode = element.getNameNode();
			const propertyNameNode = element.getPropertyNameNode() ?? nameNode;

			if (Node.isIdentifier(propertyNameNode)) {
				const propertyName = propertyNameNode.getText();

				if (propertyName === 'pathname') {
					blockLevelUsageManager.addPathname(nameNode.getText());

					++count;
				} else if (propertyName === 'query') {
					propertyNameNode
						.findReferencesAsNodes()
						.forEach((referenceNode) => {
							const parent = referenceNode.getParent();

							if (Node.isPropertyAccessExpression(parent)) {
								const nameNode = parent.getNameNode();

								if (Node.isIdentifier(nameNode)) {
									parent.replaceWithText(
										`getParam("${nameNode.getText()}")`,
									);

									blockLevelUsageManager.reportGetParamUsage();
								}
							} else if (Node.isArrayLiteralExpression(parent)) {
								referenceNode.replaceWithText('searchParams');
								blockLevelUsageManager.reportSearchParamsUsage();
							}
						});

					++count;
				} else if (propertyName === 'asPath') {
					blockLevelUsageManager.reportAsPathUsage(
						nameNode.getText(),
					);

					++count;
				}
			}
		}

		if (count === elements.length) {
			variableDeclaration.remove();
			return;
		}
	}

	blockLevelUsageManager.reportRouterUsage();
};

const handleVariableDeclaration = (
	blockLevelUsageManager: BlockLevelUsageManager,
	variableDeclaration: VariableDeclaration,
) => {
	const bindingName = variableDeclaration.getNameNode();

	if (Node.isIdentifier(bindingName)) {
		bindingName.findReferencesAsNodes().forEach((node) => {
			const parent = node.getParent();

			if (Node.isPropertyAccessExpression(parent)) {
				handleRouterPropertyAccessExpression(
					blockLevelUsageManager,
					parent,
				);
			} else if (Node.isVariableDeclaration(parent)) {
				handleVariableDeclarationWithRouter(
					parent,
					blockLevelUsageManager,
				);
			} else if (Node.isArrayLiteralExpression(parent)) {
				blockLevelUsageManager.reportRouterUsage();
			} else if (Node.isShorthandPropertyAssignment(parent)) {
				blockLevelUsageManager.reportRouterUsage();
			}
		});

		const referenceCount = bindingName.findReferencesAsNodes().length;

		if (referenceCount === 0) {
			variableDeclaration.remove();
			return;
		}
	}

	if (Node.isObjectBindingPattern(bindingName)) {
		const elements = bindingName.getElements();
		let count = 0;

		for (const element of elements) {
			const nameNode = element.getNameNode();

			if (Node.isIdentifier(nameNode)) {
				const text = nameNode.getText();

				if (text === 'query') {
					nameNode.findReferencesAsNodes().forEach((node) => {
						if (Node.isIdentifier(node)) {
							handleQueryIdentifierNode(
								node,
								blockLevelUsageManager,
							);
						}
					});

					++count;
				} else if (text === 'locale') {
					++count;
				} else if (text === 'pathname' || text === 'route') {
					blockLevelUsageManager.addPathname(text);

					++count;
				} else if (text === 'isReady') {
					blockLevelUsageManager.reportSearchParamsUsage();

					nameNode.findReferencesAsNodes().forEach((node) => {
						node.replaceWithText('searchParams !== null');
					});

					++count;
				} else if (text === 'asPath') {
					++count;

					nameNode.findReferencesAsNodes().forEach((node) => {
						const parentNode = node.getParent();

						if (Node.isPropertyAccessExpression(parentNode)) {
							const rightNode = parentNode.getName();

							parentNode.replaceWithText(`${text}.${rightNode}`);
						} else {
							node.replaceWithText(text);
						}
					});

					blockLevelUsageManager.reportAsPathUsage(text);
				} else if (text === 'push' || text === 'replace') {
					nameNode.findReferencesAsNodes().forEach((node) => {
						const parent = node.getParent();

						if (Node.isCallExpression(parent)) {
							handlePushCallExpression(parent);
						}
					});

					blockLevelUsageManager.reportRouterUsage();
				}
			} else if (Node.isObjectBindingPattern(nameNode)) {
				for (const bindingElement of nameNode.getElements()) {
					blockLevelUsageManager.addParam(buildParam(bindingElement));
				}

				++count;
			}
		}

		if (elements.length === count) {
			variableDeclaration.remove();

			return;
		}
	}
};

const handleUseRouterCallExpression = (
	blockLevelUsageManager: BlockLevelUsageManager,
	node: CallExpression,
) => {
	const parent = node.getParent();

	if (Node.isVariableDeclaration(parent)) {
		handleVariableDeclaration(blockLevelUsageManager, parent);
	} else if (Node.isPropertyAccessExpression(parent)) {
		const nameNode = parent.getNameNode();
		const grandparent = parent.getParent();

		if (!Node.isIdentifier(nameNode)) {
			return;
		}

		const text = nameNode.getText();

		if (text === 'isReady') {
			blockLevelUsageManager.reportSearchParamsUsage();
			parent.replaceWithText('searchParams !== null');
		} else if (text === 'pathname') {
			blockLevelUsageManager.addPathname('pathname');

			const grandparent = parent.getParent();

			if (Node.isVariableDeclaration(grandparent)) {
				grandparent.remove();
			}
		} else if (text === 'query') {
			if (Node.isCallExpression(grandparent)) {
				parent.replaceWithText(
					`...Object.fromEntries(searchParams ?? new URLSearchParams())`,
				);

				blockLevelUsageManager.reportSearchParamsUsage();
			} else if (Node.isElementAccessExpression(grandparent)) {
				const argumentExpression = grandparent.getArgumentExpression();

				grandparent.replaceWithText(
					`getParam(${argumentExpression?.print()})`,
				);

				blockLevelUsageManager.reportGetParamUsage();
			} else if (Node.isPropertyAccessExpression(grandparent)) {
				const nameNode = grandparent.getNameNode();

				if (Node.isIdentifier(nameNode)) {
					grandparent.replaceWithText(
						`getParam("${nameNode.getText()}")`,
					);

					blockLevelUsageManager.reportGetParamUsage();
				}
			} else if (Node.isAsExpression(grandparent)) {
				const greatgrandparent = grandparent.getParent();

				if (Node.isVariableDeclaration(greatgrandparent)) {
					const bindingName = greatgrandparent.getNameNode();

					if (Node.isObjectBindingPattern(bindingName)) {
						const text = bindingName
							.getElements()
							.map((element) => buildParam(element))
							.map(
								({ name, propertyName }) =>
									`${name} = getParam("${propertyName}")`,
							)
							.join(',\n');

						greatgrandparent.replaceWithText(text);

						blockLevelUsageManager.reportGetParamUsage();
					}
				}
			} else if (Node.isVariableDeclaration(grandparent)) {
				const bindingName = grandparent.getNameNode();

				if (Node.isObjectBindingPattern(bindingName)) {
					for (const element of bindingName.getElements()) {
						blockLevelUsageManager.addParam(buildParam(element));
					}

					grandparent.remove();
				}
			} else {
				parent.replaceWithText('searchParams');
			}
		} else if (text === 'isFallback') {
			parent.replaceWithText('false');
		} else if (text === 'asPath') {
			if (Node.isVariableDeclaration(grandparent)) {
				grandparent.findReferencesAsNodes().forEach((reference) => {
					if (Node.isIdentifier(reference)) {
						const parentNode = reference.getParent();

						if (Node.isPropertyAccessExpression(parentNode)) {
							const parentNodeName = parentNode.getName();

							parentNode.replaceWithText(
								`${text}.${parentNodeName}`,
							);
						}
					}
				});

				grandparent.remove();

				blockLevelUsageManager.reportAsPathUsage(text);
			}
		}
	}
};

const handleUseRouterIdentifier = (
	fileLevelUsageManager: FileLevelUsageManager,
	node: Identifier,
) => {
	const block = node.getFirstAncestorByKind(ts.SyntaxKind.Block);

	if (block === undefined) {
		return;
	}

	const blockIdentifiers = block.getDescendantsOfKind(
		ts.SyntaxKind.Identifier,
	);

	const blockLevelUsageManager = new BlockLevelUsageManager(
		blockIdentifiers.some(
			({ compilerNode }) => compilerNode.text === 'params',
		),
		blockIdentifiers.some(
			({ compilerNode }) => compilerNode.text === 'pathname',
		),
		blockIdentifiers.some(
			({ compilerNode }) => compilerNode.text === 'searchParams',
		),
		fileLevelUsageManager.dynamicSegments,
	);

	const parent = node.getParent();

	if (Node.isCallExpression(parent)) {
		handleUseRouterCallExpression(blockLevelUsageManager, parent);
	}

	const statements: string[] = [];

	if (blockLevelUsageManager.isRouterUsed()) {
		fileLevelUsageManager.reportRouterUsed();
	}

	const paramsIdentifierName =
		blockLevelUsageManager.getParamsIdentifierName();

	if (paramsIdentifierName !== null) {
		statements.push(`const ${paramsIdentifierName} = useParams();`);

		fileLevelUsageManager.reportParamsUsed();
	}

	const searchParamsIdentifierName =
		blockLevelUsageManager.getSearchParamsIdentifierName();

	if (searchParamsIdentifierName !== null) {
		statements.push(
			`const ${searchParamsIdentifierName} = useSearchParams();`,
		);

		fileLevelUsageManager.reportSearchParamsUsed();
	}

	for (const pathname of blockLevelUsageManager.getPathnames()) {
		statements.push(
			`/** TODO "${pathname}" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/`,
		);
		statements.push(`const ${pathname} = usePathname();`);

		fileLevelUsageManager.reportPathnameUsed();
	}

	if (
		blockLevelUsageManager.isGetParamsUsed() &&
		paramsIdentifierName != null &&
		searchParamsIdentifierName !== null
	) {
		statements.push(
			`const getParam = useCallback((p: string) => ${paramsIdentifierName}?.[p] ?? ${searchParamsIdentifierName}?.get(p), [${paramsIdentifierName}, ${searchParamsIdentifierName}]);`,
		);

		fileLevelUsageManager.useCallbackUsed = true;
	}

	{
		const [pathname] = blockLevelUsageManager.getPathnames();

		if (searchParamsIdentifierName !== null && pathname !== undefined) {
			for (const asPath of blockLevelUsageManager.getAsPath()) {
				statements.push(
					`const ${asPath} = useMemo(() => \`\${${pathname}}\${${searchParamsIdentifierName} ? "?" + ${searchParamsIdentifierName}.toString() : ""}\`, [${pathname}, ${searchParamsIdentifierName}]);`,
				);

				fileLevelUsageManager.useMemoUsed = true;
			}
		}
	}

	for (const {
		propertyName,
		name,
	} of blockLevelUsageManager.getParamsForGetParam()) {
		const argument = /(^'.+'$)|(^".+"$)/.test(propertyName)
			? `"${propertyName.slice(1, -1)}"`
			: `"${propertyName}"`;

		statements.push(`const ${name} = getParam(${argument})`);
	}

	if (paramsIdentifierName !== null) {
		for (const {
			propertyName,
			name,
		} of blockLevelUsageManager.getParamsForUseParams()) {
			const argument = /(^'.+'$)|(^".+"$)/.test(propertyName)
				? `"${propertyName.slice(1, -1)}"`
				: `"${propertyName}"`;

			statements.push(
				`const ${name} = ${paramsIdentifierName}[${argument}];`,
			);
		}
	}

	if (
		blockLevelUsageManager.getParamMap() &&
		searchParamsIdentifierName !== null &&
		paramsIdentifierName !== null
	) {
		statements.push(
			`const paramMap = useMemo(() => {
				const paramMap = new Map<string, string>(${searchParamsIdentifierName});

				Object.entries(${paramsIdentifierName}).forEach(([key, value]) => {
					if (typeof value === 'string') {
						paramMap.set(key, value);
						return;
					}

					if (value[0] !== undefined) {
						paramMap.set(key, value[0]);
					}
				});

				return paramMap;
			}, [${paramsIdentifierName}, ${searchParamsIdentifierName}]);`,
		);

		fileLevelUsageManager.useMemoUsed = true;
	}

	block.insertStatements(0, statements);
};

const handleNextRouterNamedImport = (namedImport: ImportSpecifier): void => {
	namedImport
		.getNameNode()
		.findReferencesAsNodes()
		.forEach((node) => {
			if (Node.isIdentifier(node)) {
				node.replaceWithText('AppRouterInstance');
			}
		});
};

const handleImportDeclaration = (
	fileLevelUsageManager: FileLevelUsageManager,
	importDeclaration: ImportDeclaration,
) => {
	const moduleSpecifier = importDeclaration.getModuleSpecifier();

	if (moduleSpecifier.getLiteralText() !== 'next/router') {
		return;
	}

	importDeclaration.getNamedImports().forEach((namedImport) => {
		if (namedImport.getName() === 'NextRouter') {
			handleNextRouterNamedImport(namedImport);
		}

		if (namedImport.getName() === 'useRouter') {
			namedImport
				.getNameNode()
				.findReferencesAsNodes()
				.forEach((node) => {
					if (!Node.isIdentifier(node)) {
						return;
					}

					handleUseRouterIdentifier(fileLevelUsageManager, node);
				});

			const referenceCount = namedImport
				.getNameNode()
				.findReferencesAsNodes().length;

			if (referenceCount > 1) {
				fileLevelUsageManager.reportRouterUsed();
			}
		}
	});

	importDeclaration.remove();
};

const addNamedImport = (
	sourceFile: SourceFile,
	moduleSpecifier: string,
	namedImport: string,
) => {
	const importDeclaration =
		sourceFile
			.getImportDeclarations()
			.find(
				(importDeclaration) =>
					importDeclaration.getModuleSpecifierValue() ===
						moduleSpecifier && !importDeclaration.isTypeOnly(),
			) ?? null;

	if (importDeclaration === null) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: moduleSpecifier,
			namedImports: [
				{
					name: namedImport,
				},
			],
		});

		return;
	}

	const existingImportSpecifier =
		importDeclaration
			.getNamedImports()
			.find(
				(importSpecifier) =>
					importSpecifier.getNameNode().getText() === namedImport,
			) ?? null;

	if (existingImportSpecifier === null) {
		importDeclaration.addNamedImport(namedImport);
	}
};

export const handleSourceFile = (
	sourceFile: SourceFile,
): string | undefined => {
	const standardizedFilePath = sourceFile.getFilePath();

	const dynamicSegments: string[] = [];

	for (const regExpMatchArray of standardizedFilePath.matchAll(
		/\[\[?\.*([^\/\[\]]+)\]?\]/g,
	)) {
		const dynamicSegment = regExpMatchArray[1] ?? null;

		if (dynamicSegment === null) {
			continue;
		}

		dynamicSegments.push(dynamicSegment);
	}

	const importDeclarations = sourceFile.getImportDeclarations();

	const fileLevelUsageManager = new FileLevelUsageManager(
		importDeclarations,
		dynamicSegments,
	);

	let dirtyFlag = false;

	// jest support
	sourceFile
		.getDescendantsOfKind(ts.SyntaxKind.CallExpression)
		.forEach((callExpression) => {
			const paExpression = callExpression.getExpression();

			if (!Node.isPropertyAccessExpression(paExpression)) {
				return;
			}

			const lhsExpression = paExpression.getExpression();

			if (!Node.isIdentifier(lhsExpression)) {
				return;
			}

			if (
				lhsExpression.getText() !== 'jest' &&
				paExpression.getNameNode().getText() !== 'mock'
			) {
				return;
			}

			const [zerothArgument] = callExpression.getArguments();

			if (
				!Node.isStringLiteral(zerothArgument) ||
				zerothArgument.getText().slice(1, -1) !== 'next/router'
			) {
				return;
			}

			zerothArgument.setLiteralValue('next/navigation');

			dirtyFlag = true;
		});

	if (!fileLevelUsageManager.hasAnyNextRouterImport() && !dirtyFlag) {
		return undefined;
	}

	importDeclarations.forEach((importDeclaration) =>
		handleImportDeclaration(fileLevelUsageManager, importDeclaration),
	);

	if (fileLevelUsageManager.useCallbackUsed) {
		addNamedImport(sourceFile, 'react', 'useCallback');
	}

	if (fileLevelUsageManager.useMemoUsed) {
		addNamedImport(sourceFile, 'react', 'useMemo');
	}

	const namedImports = [
		fileLevelUsageManager.shouldImportUseParams() ? 'useParams' : null,
		fileLevelUsageManager.shouldImportUsePathname() ? 'usePathname' : null,
		fileLevelUsageManager.shouldImportUseRouter() ? 'useRouter' : null,
		fileLevelUsageManager.shouldImportUseSearchParams()
			? 'useSearchParams'
			: null,
	]
		.filter((x): x is string => x !== null)
		.sort();

	if (namedImports.length > 0) {
		sourceFile.insertStatements(
			0,
			`import { ${namedImports.join(', ')} } from "next/navigation";`,
		);
	}

	if (fileLevelUsageManager.shouldImportAppRouterInstance()) {
		sourceFile.insertStatements(
			0,
			'import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context";',
		);
	}

	return sourceFile.getFullText();
};
