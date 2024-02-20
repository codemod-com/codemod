/*! @license
The MIT License (MIT)

Copyright (c) 2023 Rajasegar Chandran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Changes to the original file: added TypeScript, dirty flag, nullability checks
*/

import type { API, FileInfo, Options, Transform } from "jscodeshift";

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);

	let dirtyFlag = false;

	root
		.find(j.VariableDeclarator, {
			init: { callee: { name: "withProps" } },
		})
		.forEach((path) => {
			const hocName = "name" in path.value.id ? path.value.id.name : null;

			const arg =
				path.value.init && "arguments" in path.value.init
					? path.value.init.arguments[1]
					: null;

			const hocProps =
				arg && "properties" in arg
					? arg.properties
							.map((h) => ("key" in h && "name" in h.key ? h.key.name : null))
							.filter((name): name is string => typeof name === "string")
					: [];

			if (!hocName) {
				return;
			}

			root
				.find(j.JSXElement, {
					openingElement: { name: { name: "Route" } },
				})
				.filter((c) => {
					const attrs = c.value.openingElement.attributes ?? [];

					return (
						attrs.filter(
							(a) =>
								"name" in a &&
								a.name.name === "component" &&
								"value" in a &&
								a.value?.type === "JSXExpressionContainer" &&
								"name" in a.value.expression &&
								a.value.expression.name === hocName,
						).length > 0
					);
				})
				.forEach((c) => {
					const [compAttr] =
						c.value.openingElement.attributes?.filter((a) =>
							"name" in a ? a.name.name === "component" : false,
						) ?? [];

					if (!compAttr || !("name" in compAttr)) {
						return;
					}

					const newProps = hocProps.map((h) => {
						return j.jsxAttribute(
							j.jsxIdentifier(h),
							j.jsxExpressionContainer(j.identifier("title")),
						);
					});

					const newComp = j.jsxElement(
						j.jsxOpeningElement(
							j.jsxIdentifier("Dashboard"),
							[...newProps, j.jsxSpreadAttribute(j.jsxIdentifier("props"))],
							true,
						),
						null,
						[],
					);

					compAttr.name.name = "render";

					compAttr.value = j.jsxExpressionContainer(
						j.arrowFunctionExpression(
							[j.jsxIdentifier("props")],
							j.blockStatement([j.returnStatement(newComp)]),
							true,
						),
					);
				});

			j(path.parentPath.parentPath).remove();

			dirtyFlag = true;
		});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
