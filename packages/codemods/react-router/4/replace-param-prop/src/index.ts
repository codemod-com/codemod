import type {
	API,
	FileInfo,
	JSCodeshift,
	Options,
	Transform,
} from 'jscodeshift';

let buildParamsVariableDeclaration = (j: JSCodeshift) =>
	j.variableDeclaration('const', [
		j.variableDeclarator(
			j.objectPattern([
				j.objectProperty.from({
					shorthand: true,
					key: j.identifier('params'),
					value: j.identifier('params'),
				}),
			]),
			j.identifier('match'),
		),
	]);

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	root.find(j.ArrowFunctionExpression).forEach((path) => {
		let name = path.parent.value.id.name;
		let usesRedux = ['mapStateToProps', 'mapDispatchToProps'].includes(
			name,
		);

		let [arg1, arg2] = path.node.params;

		let targetArg = usesRedux ? arg2 : arg1;

		if (j.ObjectPattern.check(targetArg)) {
			let firstProperty = targetArg.properties[0];

			if (
				j.Property.check(firstProperty) &&
				j.Identifier.check(firstProperty.key) &&
				firstProperty.key.name === 'params'
			) {
				firstProperty.key.name = 'match';
			}

			let newDeclaration = buildParamsVariableDeclaration(j);

			let body = path.value.body;

			if (j.BlockStatement.check(body)) {
				body.body.unshift(newDeclaration);
			}
		}

		if (j.Identifier.check(targetArg)) {
			j(path)
				.find(j.MemberExpression)
				.forEach((memberPath) => {
					let memberObject = memberPath.node.object;

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
		}
	});

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
