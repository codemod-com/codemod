import type { API, FileInfo } from 'jscodeshift';

function transform(file: FileInfo, api: API): string | undefined {
	let j = api.jscodeshift;

	let root = j(file.source);

	root.find(j.ImportDeclaration, {
		source: {
			value: 'react-router-dom',
		},
	}).replaceWith((path) => {
		if (!path.value.specifiers) {
			return path.node;
		}

		let browserHistoryImportSpecifier = path.value.specifiers.find(
			(specifier) => {
				if (!j.ImportSpecifier.check(specifier)) {
					return false;
				}

				return specifier.imported.name === 'browserHistory';
			},
		);
		if (browserHistoryImportSpecifier) {
			return j.importDeclaration(
				[j.importSpecifier(j.identifier('useHistory'))],
				j.literal('react-router-dom'),
			);
		}
		return path.node;
	});

	root.find(j.Identifier, {
		name: 'browserHistory',
	}).forEach((path) => {
		let functionalComponentAncestor =
			j(path).closest(j.FunctionDeclaration) ??
			j(path).closest(j.ArrowFunctionExpression);

		if (!functionalComponentAncestor.length) {
			// Arrow Functions in which `browserHistory` is used might not be found.
			// In this case, simply replace `browserHistory` with `useHistory()`.
			path.replace(j.callExpression(j.identifier('useHistory'), []));
			return;
		}

		let value = functionalComponentAncestor.get().value;

		if (value.type === 'CallExpression') {
			return;
		}

		let browserHistoryDeclaration = j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('browserHistory'),
				j.callExpression(j.identifier('useHistory'), []),
			),
		]);
		value.body.body.unshift(browserHistoryDeclaration);
	});

	return root.toSource();
}

export default transform;
