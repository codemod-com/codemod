import type { API, FileInfo } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Find all calls to addHandler method
	root
		.find(j.CallExpression, {
			callee: {
				type: "MemberExpression",
				property: {
					type: "Identifier",
					name: "addHandler",
				},
			},
		})
		.replaceWith((path) => {
			// Replace addHandler with addApiHandler
			if (
				"property" in path.node.callee &&
				"name" in path.node.callee.property
			) {
				path.node.callee.property.name = "addApiHandler";
			}

			return path.node;
		});

	return root.toSource();
}
