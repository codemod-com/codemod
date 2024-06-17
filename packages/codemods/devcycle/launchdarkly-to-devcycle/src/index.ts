import type {
	API,
	ASTPath,
	CallExpression,
	Collection,
	FileInfo,
	Identifier,
	JSCodeshift,
	ObjectExpression,
	Options,
} from 'jscodeshift';

/**
 * Utils
 */
let collectImportNames = (j: JSCodeshift, root: Collection, source: string) => {
	let importSpecifierLocalNames = new Map<string, string>();

	let importDefaultSpecifierName: string | null = null;
	let importNamespaceSpecifierName: string | null = null;

	root.find(j.ImportDeclaration, {
		source: { value: source },
	}).forEach((path) => {
		path.value.specifiers?.forEach((specifier) => {
			if (j.ImportSpecifier.check(specifier)) {
				importSpecifierLocalNames.set(
					specifier.imported.name,
					specifier.local?.name ?? '',
				);
			}

			if (j.ImportDefaultSpecifier.check(specifier) && specifier.local) {
				importDefaultSpecifierName = specifier.local.name;
			}

			if (
				j.ImportNamespaceSpecifier.check(specifier) &&
				specifier.local
			) {
				importNamespaceSpecifierName = specifier.local.name;
			}
		});
	});

	return {
		importSpecifierLocalNames,
		importDefaultSpecifierName,
		importNamespaceSpecifierName,
	};
};

let getLibraryMethodCallMatcher =
	(
		j: JSCodeshift,
		importSpecifiersLocalNames: string[],
		importedModuleName: string,
	) =>
	(path: ASTPath<CallExpression>) => {
		let { callee } = path.value;

		if (
			j.Identifier.check(callee) &&
			importSpecifiersLocalNames.includes(callee.name)
		) {
			return callee.name;
		}

		if (
			j.MemberExpression.check(callee) &&
			j.Identifier.check(callee.object) &&
			callee.object.name === importedModuleName &&
			j.Identifier.check(callee.property)
		) {
			return callee.property.name;
		}

		return null;
	};

let getImportDeclaration = (
	j: JSCodeshift,
	root: Collection<any>,
	importName: string,
) =>
	root
		.find(j.ImportDeclaration, {
			source: { value: importName },
		})
		.paths()
		.at(0)?.node;

let buildImportDeclaration = (j: JSCodeshift, sourceName: string) => {
	return j.importDeclaration([], j.literal(sourceName));
};

let addNamedImport = (
	j: JSCodeshift,
	root: Collection<any>,
	importName: string,
	sourceName: string,
) => {
	let existingImportDeclaration = getImportDeclaration(j, root, sourceName);
	let importDeclaration =
		existingImportDeclaration ?? buildImportDeclaration(j, sourceName);

	let importSpecifier = j.importSpecifier(j.identifier(importName));

	if (
		importDeclaration.specifiers?.findIndex(
			(s) =>
				importSpecifier.imported &&
				s.local?.name === importSpecifier.imported.name,
		) === -1
	) {
		importDeclaration.specifiers?.push(importSpecifier);
	}

	if (!existingImportDeclaration) {
		let body = root.get().node.program.body;
		body.unshift(importDeclaration);
	}
};

/**
 * Replacement functions
 */

let LDToDevCycleConfigPropsMap: Record<string, string> = {
	clientSideID: 'sdkKey',
};

let buildDVCConfig = (j: JSCodeshift, node: ObjectExpression) => {
	let newProperties = node.properties
		.map((p) => {
			if (
				!j.ObjectProperty.check(p) ||
				!j.Identifier.check(p.key) ||
				!LDToDevCycleConfigPropsMap[p.key.name]
			) {
				return;
			}

			return j.objectProperty(
				j.identifier(LDToDevCycleConfigPropsMap[p.key.name]),
				p.value,
			);
		})
		.filter(Boolean);

	return j.objectExpression(newProperties);
};

let replaceWithLDProvider = (
	j: JSCodeshift,
	root: Collection,
	path: ASTPath<CallExpression>,
) => {
	let config = path.node.arguments.at(0);

	if (!j.ObjectExpression.check(config)) {
		return;
	}

	let newConfig = buildDVCConfig(j, config);

	let newCE = j.callExpression(j.identifier('withDevCycleProvider'), [
		newConfig,
	]);

	path.replace(newCE);

	addNamedImport(
		j,
		root,
		'withDevCycleProvider',
		'@devcycle/react-client-sdk',
	);
};

let replaceUseFlags = (
	j: JSCodeshift,
	root: Collection,
	path: ASTPath<CallExpression>,
) => {
	let allVariables = j.memberExpression(
		j.callExpression(j.identifier('useDevCycleClient'), []),
		j.callExpression(j.identifier('allVariables'), []),
	);

	let parent = path.parent.node;
	let variable: Identifier | null = null;

	// check variables
	if (j.VariableDeclarator.check(parent)) {
		let id = parent.id;

		if (j.ObjectPattern.check(id)) {
			let firstProp = id.properties.at(0);

			if (
				j.ObjectProperty.check(firstProp) &&
				j.Identifier.check(firstProp.value)
			) {
				variable = firstProp.value;
			}
		}
	}

	if (variable !== null) {
		root.find(j.Identifier, {
			name: variable.name,
		}).forEach((path) => {
			if (
				path.node.start === variable.start &&
				path.node.end === variable.end
			) {
				return;
			}

			path.replace(j.memberExpression(path.node, j.identifier('value')));
		});
	}

	path.replace(allVariables);
	addNamedImport(j, root, 'useDevCycleClient', '@devcycle/react-client-sdk');
};

let replacementFunctions: Record<
	string,
	(j: JSCodeshift, root: Collection, path: ASTPath<any>) => void
> = {
	withLDProvider: replaceWithLDProvider,
	useFlags: replaceUseFlags,
};

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let isDirty = false;

	let {
		importNamespaceSpecifierName,
		importDefaultSpecifierName,
		importSpecifierLocalNames,
	} = collectImportNames(j, root, 'launchdarkly-react-client-sdk');

	let importedModuleName =
		importDefaultSpecifierName ?? importNamespaceSpecifierName ?? '';

	let matchMethod = getLibraryMethodCallMatcher(
		j,
		[...importSpecifierLocalNames.values()],
		importedModuleName,
	);

	root.find(j.CallExpression).forEach((path) => {
		let match = matchMethod(path);

		if (match === null) {
			return;
		}

		let replacementFunction = replacementFunctions[match];

		if (replacementFunction) {
			replacementFunction(j, root, path);
			isDirty = true;
		}
	});

	if (isDirty) {
		// @TODO check if not used
		root.find(j.ImportDeclaration, {
			source: {
				value: 'launchdarkly-react-client-sdk',
			},
		}).remove();
	}

	return isDirty ? root.toSource() : undefined;
}
