import type { API, FileInfo, Options, Transform } from 'jscodeshift';

let transform: Transform = (file: FileInfo, api: API, options: Options) => {
	let j = api.jscodeshift;
	let root = j(file.source);

	let dirtyFlag = false;
	let hName: string | null = null;

	// Find the render method and update it
	root.find(j.ObjectMethod, { key: { name: 'render' } }).forEach((path) => {
		let firstParam = path.value.params.at(0);

		if (j.Identifier.check(firstParam)) {
			hName = firstParam.name;

			path.value.params = [];
			dirtyFlag = true;
		}
	});

	if (!dirtyFlag || hName === null) {
		return undefined;
	}

	// Add import statement for 'h' from 'vue'
	let importStatement = j.importDeclaration(
		[j.importSpecifier(j.identifier(hName))],
		j.literal('vue'),
	);

	root.get().node.program.body.unshift(importStatement);

	return root.toSource(options);
};

export default transform;
