import type { API, FileInfo } from 'jscodeshift';

function transform(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.MemberExpression, {
		object: {
			name: 'location',
		},
		property: {
			name: 'query',
		},
	}).replaceWith(() =>
		j.callExpression(j.identifier('parse'), [
			j.memberExpression(
				j.identifier('location'),
				j.identifier('search'),
			),
		]),
	);

	const hasQueryStringImport =
		root.find(j.ImportDeclaration, {
			source: {
				value: 'query-string',
			},
		}).length > 0;

	if (!hasQueryStringImport) {
		root.find(j.Program).forEach((path) => {
			path.node.body.unshift(
				j.importDeclaration(
					[j.importSpecifier(j.identifier('parse'), null)],
					j.literal('query-string'),
				),
			);
		});
	}

	return root.toSource();
}

export default transform;
