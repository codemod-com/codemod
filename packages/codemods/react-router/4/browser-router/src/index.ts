import type { API, FileInfo } from 'jscodeshift';

function transform(file: FileInfo, api: API): string | undefined {
	let j = api.jscodeshift;

	let root = j(file.source);

	root.find(j.JSXElement, {
		openingElement: { name: { name: 'Router' } },
	}).forEach((path) => {
		let attrs = path.value.openingElement.attributes;

		let historyAttr =
			attrs?.filter((a) =>
				'name' in a ? a.name.name === 'history' : false,
			).length ?? false;

		if (attrs && historyAttr) {
			if ('name' in path.value.openingElement.name) {
				path.value.openingElement.name.name = 'BrowserRouter';
			}

			if (
				path.value.closingElement &&
				'name' in path.value.closingElement.name
			) {
				path.value.closingElement.name.name = 'BrowserRouter';
			}

			path.value.openingElement.attributes = attrs.filter((a) =>
				'name' in a ? a.name.name !== 'history' : false,
			);
		}

		let computedImport = j.importDeclaration(
			[j.importSpecifier(j.identifier('BrowserRouter'))],
			j.literal('react-router-dom'),
		);

		let body = root.get().value.program.body;
		body.unshift(computedImport);
	});

	return root.toSource();
}

export default transform;
