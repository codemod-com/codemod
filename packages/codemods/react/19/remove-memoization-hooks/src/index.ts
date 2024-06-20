import type { API, FileInfo } from 'jscodeshift';

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let hooksToRemove = ['useMemo', 'useCallback', 'memo'];

	root.find(j.ImportDeclaration).forEach((path) => {
		if (path.node.specifiers?.length === 0) {
			return;
		}

		let specifiers =
			path.node.specifiers?.filter((specifier) => {
				if (specifier.type === 'ImportSpecifier') {
					return !hooksToRemove.includes(specifier.imported.name);
				}
				return specifier;
			}) ?? [];

		if (specifiers.length === 0) {
			j(path).remove();
		} else {
			path.node.specifiers = specifiers;
		}
	});

	hooksToRemove.forEach((hook) => {
		root.find(j.CallExpression, {
			callee: {
				type: 'Identifier',
				name: hook,
			},
		}).replaceWith((path) => path.value.arguments[0]);
	});

	hooksToRemove.forEach((hook) => {
		root.find(j.CallExpression, {
			callee: {
				type: 'MemberExpression',
				object: { name: 'React' },
				property: { name: hook },
			},
		}).replaceWith((path) => path.value.arguments[0]);
	});

	return root.toSource();
}
