import type { FileInfo, API, Options } from "jscodeshift";
export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Helper function to preserve leading comments
	function replaceWithComments(path, newNode) {
		// If the original node had comments, add them to the new node
		if (path.node.comments) {
			newNode.comments = path.node.comments;
		}

		// Replace the node
		j(path).replaceWith(newNode);
	}

	// Find JSX elements with ref attribute
	root
		.find(j.JSXElement, {
			openingElement: {
				attributes: [
					{
						type: "JSXAttribute",
						name: {
							type: "JSXIdentifier",
							name: "ref",
						},
					},
				],
			},
		})
		.forEach((path) => {
			// Get the ref name
			const refName = path.node.openingElement.attributes.find(
				(attr) => attr.name.name === "ref",
			).value.value;

			// Create new ref attribute
			const newRefAttr = j.jsxAttribute(
				j.jsxIdentifier("ref"),
				j.jsxExpressionContainer(
					j.arrowFunctionExpression(
						[j.identifier("ref")],
						j.blockStatement([
							j.expressionStatement(
								j.assignmentExpression(
									"=",
									j.memberExpression(
										j.thisExpression(),
										j.identifier("refs." + refName),
									),
									j.identifier("ref"),
								),
							),
							j.returnStatement(
								j.unaryExpression(
									"delete",
									j.memberExpression(
										j.thisExpression(),
										j.identifier("refs." + refName),
									),
								),
							),
						]),
					),
				),
			);

			// Replace old ref attribute with new one
			replaceWithComments(path, newRefAttr);
		});

	return root.toSource();
}
