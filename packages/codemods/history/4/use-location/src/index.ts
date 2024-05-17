import type { API, FileInfo } from 'jscodeshift';

function transform(file: FileInfo, api: API): string | undefined {
	let j = api.jscodeshift;

	let root = j(file.source);

	root.find(j.CallExpression, {
		callee: {
			type: 'MemberExpression',
			object: { name: 'history' },
			property: { name: 'getCurrentLocation' },
		},
	}).forEach((path) => {
		let identifierPath = j(path)
			.find(j.Identifier, { name: 'getCurrentLocation' })
			.paths()
			.at(0);

		if (!identifierPath) {
			return;
		}

		identifierPath.replace(j.identifier.from({ name: 'location' }));
	});

	return root.toSource();
}

export default transform;
