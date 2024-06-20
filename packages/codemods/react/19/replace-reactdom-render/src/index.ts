import type {
	API,
	ASTPath,
	CallExpression,
	Collection,
	FileInfo,
	JSCodeshift,
} from 'jscodeshift';

let getMatcher =
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

let replaceHydrate = (
	j: JSCodeshift,
	root: Collection,
	path: ASTPath<CallExpression>,
) => {
	let args = path.value.arguments;

	let hydrateRoot = j.expressionStatement(
		j.callExpression(j.identifier('hydrateRoot'), [args[1], args[0]]),
	);

	addNamedImport(j, root, 'hydrateRoot', 'react-dom/client');
	path.parent.replace(hydrateRoot);
};

let replaceRender = (
	j: JSCodeshift,
	root: Collection,
	path: ASTPath<CallExpression>,
) => {
	let args = path.value.arguments;

	let createRoot = j.variableDeclaration('const', [
		j.variableDeclarator(
			j.identifier('root'),
			j.callExpression(j.identifier('createRoot'), [args[1]]),
		),
	]);

	let render = j.expressionStatement(
		j.callExpression(
			j.memberExpression(j.identifier('root'), j.identifier('render')),
			[args[0]],
		),
	);

	addNamedImport(j, root, 'createRoot', 'react-dom/client');

	path.parent.replace(createRoot);
	path.parent.insertAfter(render);
};

let replaceUnmountComponentAtNode = (
	j: JSCodeshift,
	root: Collection,
	path: ASTPath<CallExpression>,
) => {
	let args = path.value.arguments;

	let createRoot = j.variableDeclaration('const', [
		j.variableDeclarator(
			j.identifier('root'),
			j.callExpression(j.identifier('createRoot'), [args[0]]),
		),
	]);

	let unmount = j.expressionStatement(
		j.callExpression(
			j.memberExpression(j.identifier('root'), j.identifier('unmount')),
			[],
		),
	);

	addNamedImport(j, root, 'createRoot', 'react-dom/client');

	path.parent.replace(createRoot);
	path.parent.insertAfter(unmount);
};

let replacementFunctions: Record<string, (...args: any) => any> = {
	render: replaceRender,
	hydrate: replaceHydrate,
	unmountComponentAtNode: replaceUnmountComponentAtNode,
};

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let isDirty = false;

	let {
		importNamespaceSpecifierName,
		importDefaultSpecifierName,
		importSpecifierLocalNames,
	} = collectImportNames(j, root, 'react-dom');

	let importedModuleName =
		importDefaultSpecifierName ?? importNamespaceSpecifierName ?? '';

	let matchMethod = getMatcher(
		j,
		[...importSpecifierLocalNames.values()],
		importedModuleName,
	);

	root.find(j.CallExpression).forEach((path) => {
		let match = matchMethod(path);

		if (match === null) {
			return;
		}

		let replaceMethod = replacementFunctions[match];

		if (replaceMethod) {
			replaceMethod(j, root, path);
			isDirty = true;
		}
	});

	return isDirty ? root.toSource() : undefined;
}
