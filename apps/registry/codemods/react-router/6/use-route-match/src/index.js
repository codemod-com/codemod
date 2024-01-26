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

export default function transform(file, api) {
	const j = api.jscodeshift;

	const root = j(file.source);

	root.find(j.CallExpression, {
		callee: { name: 'useRouteMatch' },
	}).forEach((path) => {
		path.value.callee.name = 'useMatch';

		if (path.value.arguments.length > 0) {
			const args = path.value.arguments;

			args.filter((a) => a.type === 'ObjectExpression').forEach((a) => {
				const [strictVal] = a.properties.filter(
					(p) => p.key.name === 'strict',
				);
				if (strictVal) {
					strictVal.key.name = 'end';
				}
				const [sensitiveVal] = a.properties.filter(
					(p) => p.key.name === 'sensitive',
				);
				if (sensitiveVal) {
					sensitiveVal.key.name = 'caseSensitive';
				}
			});
		}
	});

	return root.toSource();
}
