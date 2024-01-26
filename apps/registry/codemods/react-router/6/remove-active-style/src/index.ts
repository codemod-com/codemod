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

import type { API, FileInfo, Options, Transform } from 'jscodeshift';

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);

	let dirtyFlag = false;

	root.findJSXElements('NavLink')
		// .filter(hasAttributes({ style: () => true, activeStyle: () => true }))
		.forEach((path) => {
			const attrs = path.value.openingElement.attributes;

			if (!attrs) {
				return;
			}

			const [styleAttr] = attrs.filter((a) =>
				'name' in a ? a.name.name === 'style' : false,
			);

			if (
				!styleAttr ||
				!('value' in styleAttr) ||
				!styleAttr.value ||
				!('expression' in styleAttr.value) ||
				!styleAttr.value.expression ||
				!('properties' in styleAttr.value.expression) ||
				!styleAttr.value.expression.properties[0] ||
				!('key' in styleAttr.value.expression.properties[0]) ||
				!('name' in styleAttr.value.expression.properties[0].key) ||
				!('value' in styleAttr.value.expression.properties[0]) ||
				!('value' in styleAttr.value.expression.properties[0].value) ||
				!styleAttr.value.expression.properties[0].value.value
			) {
				return;
			}

			const cssProp = styleAttr.value.expression.properties[0].key.name;

			if (typeof cssProp != 'string') {
				return;
			}

			const [activeStyleAttr] = attrs.filter((a) =>
				'name' in a ? a.name.name === 'activeStyle' : false,
			);

			if (
				!activeStyleAttr ||
				!('value' in activeStyleAttr) ||
				!activeStyleAttr.value ||
				!('expression' in activeStyleAttr.value) ||
				!('properties' in activeStyleAttr.value.expression) ||
				!activeStyleAttr.value.expression.properties[0] ||
				!('value' in activeStyleAttr.value.expression.properties[0]) ||
				!(
					'value' in
					activeStyleAttr.value.expression.properties[0].value
				) ||
				!activeStyleAttr.value.expression.properties[0].value.value
			) {
				return;
			}

			const idx = attrs.findIndex((a) =>
				'name' in a ? a.name.name === 'activeStyle' : false,
			);
			// remove activeStyle prop
			attrs.splice(idx, 1);

			const propertyNode = j.property(
				'init',
				j.literal('isActive'),
				j.identifier('isActive'),
			);

			const arrFuncBody = j.objectExpression([
				j.property(
					'init',
					j.literal(cssProp),
					j.conditionalExpression(
						j.identifier('isActive'),
						j.literal(
							activeStyleAttr.value.expression.properties[0].value
								.value,
						),
						j.literal(
							styleAttr.value.expression.properties[0].value
								.value,
						),
					),
				),
			]);

			styleAttr.value = j.jsxExpressionContainer(
				j.arrowFunctionExpression(
					[j.objectPattern([propertyNode])],
					arrFuncBody,
				),
			);

			dirtyFlag = true;
		});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
