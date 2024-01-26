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

Changes to the original file: added the options parameter
*/

export default function transform(file, api, options) {
	const j = api.jscodeshift;

	const root = j(file.source);

	const hasChildren = (name) => {
		return function filter(path) {
			return (
				j.JSXElement.check(path.value) &&
				path.value.children.some(
					(child) =>
						j.JSXElement.check(child) &&
						child.openingElement.name.name === name,
				)
			);
		};
	};

	root.findJSXElements('Switch')
		.filter(hasChildren('Redirect'))
		.forEach((path) => {
			j(path)
				.findJSXElements('Redirect')
				.forEach((c) => {
					c.value.openingElement.name.name = 'Route';
					const attrs = c.value.openingElement.attributes;
					const [fromAttr] = attrs.filter(
						(a) => a.name.name === 'from',
					);
					const [toAttr] = attrs.filter((a) => a.name.name === 'to');

					const newEl = j.jsxElement(
						j.jsxOpeningElement(
							j.jsxIdentifier('Route'),
							[
								j.jsxAttribute(
									j.jsxIdentifier('to'),
									toAttr.value,
								),
							],
							true,
						),
						null,
						[],
						false,
					);

					const newAttrs = [
						j.jsxAttribute(j.jsxIdentifier('path'), fromAttr.value),
						j.jsxAttribute(
							j.jsxIdentifier('render'),
							j.jsxExpressionContainer(
								j.arrowFunctionExpression([], newEl),
							),
						),
					];

					c.value.openingElement.attributes = newAttrs;
				});
		});

	return root.toSource(options);
}
