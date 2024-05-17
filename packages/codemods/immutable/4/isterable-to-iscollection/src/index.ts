import type { API, FileInfo, Options, Transform } from 'jscodeshift';

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);
	let dirtyFlag = false;

	root.find(j.Identifier).forEach((path) => {
		if (path.node.name === 'isIterable') {
			path.node.name = 'isCollection';
			dirtyFlag = true;
		}
	});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
