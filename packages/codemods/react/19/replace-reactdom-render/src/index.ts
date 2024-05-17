import type { API, FileInfo, Options } from 'jscodeshift';

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let reactDomRenderNamedImportLocalName: string | null = null;
	let reactDomDefaultImportName: string | null = null;

	let isDirty = false;
	root.find(j.ImportDeclaration, {
		source: { value: 'react-dom' },
	}).forEach((path) => {
		path.value.specifiers?.forEach((specifier) => {
			// named import
			if (
				j.ImportSpecifier.check(specifier) &&
				specifier.imported.name === 'render'
			) {
				reactDomRenderNamedImportLocalName =
					specifier.local?.name ?? null;
			}

			// default and wildcard import
			if (
				j.ImportDefaultSpecifier.check(specifier) ||
				j.ImportNamespaceSpecifier.check(specifier)
			) {
				reactDomDefaultImportName = specifier.local?.name ?? null;
			}
		});
	});

	root.find(j.CallExpression)
		.filter((path) => {
			let { callee } = path.value;

			if (
				j.Identifier.check(callee) &&
				callee.name === reactDomRenderNamedImportLocalName
			) {
				return true;
			}

			if (
				j.MemberExpression.check(callee) &&
				j.Identifier.check(callee.object) &&
				callee.object.name === reactDomDefaultImportName &&
				j.Identifier.check(callee.property) &&
				callee.property.name === 'render'
			) {
				return true;
			}

			return false;
		})
		.forEach((path) => {
			let args = path.value.arguments;

			let createRoot = j.variableDeclaration('const', [
				j.variableDeclarator(
					j.identifier('root'),
					j.callExpression(j.identifier('createRoot'), [args[1]]),
				),
			]);

			let render = j.expressionStatement(
				j.callExpression(
					j.memberExpression(
						j.identifier('root'),
						j.identifier('render'),
					),
					[args[0]],
				),
			);

			isDirty = true;
			let body = root.get().node.program.body;

			let importStatement = j.importDeclaration(
				[j.importSpecifier(j.identifier('createRoot'))],
				j.literal('react-dom/client'),
			);
			body.unshift(importStatement);

			path.parent.replace(createRoot);
			path.parent.insertAfter(render);
		});

	if (isDirty) {
	}

	return isDirty ? root.toSource() : undefined;
}
