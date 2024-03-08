import type { API, FileInfo, JSXElement } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	const routes = root.find(j.JSXElement, {
		openingElement: {
			name: {
				name: "Route",
			},
		},
		closingElement: {
			name: {
				name: "Route",
			},
		},
	});

	routes.forEach((route) => {
		const { node } = route;

		const elementChildren: JSXElement[] = [];
		node.children.forEach((child) => {
			if (child.type !== "JSXElement") {
				return;
			}
			elementChildren.push(child);
		});

		if (elementChildren.length === 0) {
			return;
		}

		const componentProp = node.openingElement.attributes.find(
			(attr) => attr.type === "JSXAttribute" && attr.name.name === "component",
		);

		if (!componentProp || componentProp.type !== "JSXAttribute") {
			return;
		}

		const value = componentProp.value;

		if (
			j.JSXExpressionContainer.check(value) &&
			j.Identifier.check(value.expression)
		) {
			const componentName = value.expression.name;
			const renderProp = j.jsxAttribute(
				j.jsxIdentifier("render"),
				j.jsxExpressionContainer(
					j.arrowFunctionExpression(
						[j.identifier("props")],
						j.parenthesizedExpression(
							j.jsxElement(
								j.jsxOpeningElement(j.jsxIdentifier(componentName), [
									j.jsxSpreadAttribute(j.identifier("props")),
								]),
								j.jsxClosingElement(j.jsxIdentifier(componentName)),
								node.children,
							),
						),
					),
				),
			);

			// Replace the component prop with the new render prop
			node.openingElement.attributes = node.openingElement.attributes.filter(
				(attr) => attr !== componentProp,
			);
			node.openingElement.attributes.push(renderProp);
			node.children = [];
		}
	});

	return root.toSource();
}

export default transform;
