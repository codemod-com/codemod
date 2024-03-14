import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);

	root
		.find(j.CallExpression, {
			callee: {
				type: "MemberExpression",
				object: { name: "history" },
				property: { name: "listenBefore" },
			},
		})
		.forEach((path) => {
			const identifierPath = j(path)
				.find(j.Identifier, { name: "listenBefore" })
				.paths()
				.at(0);

			if (!identifierPath) {
				return;
			}

			// Rename `listenBefore` to `block`
			identifierPath.replace(j.identifier.from({ name: "block" }));

			const arg = path.value.arguments[0];
			if (!arg || !j.ArrowFunctionExpression.check(arg)) {
				return;
			}

			const [locationNode, callbackNode] = arg.params;
			const properties = [];

			if (locationNode) {
				properties.push(
					j.objectProperty.from({
						key: j.identifier("location"),
						value: j.identifier("location"),
						shorthand: true,
					}),
				);
			}

			if (callbackNode) {
				properties.push(
					j.objectProperty.from({
						key: j.identifier("action"),
						value: j.identifier("action"),
						shorthand: true,
					}),
				);
			}

			if (properties.length === 0) {
				return;
			}

			const objectPattern = j.objectPattern.from({
				properties,
			});

			arg.params = [objectPattern];

			if (j.Identifier.check(callbackNode)) {
				const callbackName = callbackNode.name;
				j(path)
					.find(j.Identifier, {
						type: "Identifier",
						name: callbackName,
					})
					.forEach((path) => {
						path.replace(j.identifier.from({ name: "action" }));
					});
			}
		});

	return root.toSource();
}

export default transform;
