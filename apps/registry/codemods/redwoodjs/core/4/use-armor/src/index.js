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

Changes to the original file: add the options parameter
*/

export default function transform(file, api, options) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	// Within createGraphQLHandler, look for the `depthLimitOptions` option and replace it with `armorConfig`
	// and the original value of `maxDepth`
	ast.find(j.CallExpression, {
		callee: { name: 'createGraphQLHandler' },
	}).forEach((path) => {
		const props = path.value.arguments[0].properties.filter(
			(p) => p.key.name === 'depthLimitOptions',
		);

		if (props.length > 0) {
			const [prop] = props;

			prop.key.name = 'armorConfig';

			const val = prop.value.properties[0].value.value;

			const newValue = j.objectExpression([
				j.objectProperty(
					j.identifier('maxDepth'),
					j.objectExpression([
						j.objectProperty(
							j.identifier('n'),
							j.numericLiteral(val),
							false,
							false,
						),
					]),
					false,
					false,
				),
			]);

			prop.value = newValue;
		}
	});

	return ast.toSource(options);
}
