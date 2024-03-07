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
		.find(j.JSXElement, {
			openingElement: {
				name: { name: "Link" },
			},
		})
		.forEach((path) => {
			const props = path.value.openingElement.attributes ?? [];

			props
				.filter((prop) => ("name" in prop ? prop.name.name === "to" : false))
				.forEach((prop) => {
					const values =
						"value" in prop &&
						prop.value &&
						"expression" in prop.value &&
						"properties" in prop.value.expression
							? prop.value.expression.properties
							: [];

					values.forEach((v) => {
						if (
							"key" in v &&
							"name" in v.key &&
							v.key.name === "pathname" &&
							"value" in prop &&
							"value" in v &&
							"value" in v.value &&
							v.value.value
						) {
							prop.value = j.literal(v.value.value);

							dirtyFlag = true;
						}

						if ("key" in v && "name" in v.key && v.key.name === "state") {
							const newProp = j.jsxAttribute(
								j.jsxIdentifier(v.key.name),
								j.jsxExpressionContainer(j.identifier("state")),
							);

							if (path.value.openingElement.attributes) {
								path.value.openingElement.attributes.push(newProp);
							} else {
								path.value.openingElement.attributes = [newProp];
							}

							dirtyFlag = true;
						}
					});
				});
		});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
