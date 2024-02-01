import type { API, FileInfo, Options, Transform } from 'jscodeshift';

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.ArrowFunctionExpression).forEach((path) => {
		const firstArg = path.node.params[0];
		if (j.ObjectPattern.check(firstArg)) {
			const firstProperty = firstArg.properties[0];

			if (
				j.Property.check(firstProperty) &&
				j.Identifier.check(firstProperty.key) &&
				firstProperty.key.name === 'params'
			) {
				firstProperty.key.name = 'match';
			}
		}

		j(path)
			.find(j.MemberExpression)
			.forEach((memberPath) => {
				const memberObject = memberPath.node.object;

				if (
					j.Identifier.check(memberObject) &&
					memberObject.name === 'params'
				) {
					memberPath.node.object = j.memberExpression(
						j.identifier('match'),
						j.identifier('params'),
					);
				}
			});
	});

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
