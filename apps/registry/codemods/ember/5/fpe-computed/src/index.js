/*! @license
This code is based on a public codemod, which is subject to the original license terms.
Original codemod: https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/fpe-computed/index.js

MIT License

Copyright (c) 2019 ember-codemods

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export default function transform(file, api) {
	const j = api.jscodeshift;

	const root = j(file.source);

	let alreadyHasImport = false;

	const importDeclaration = root.find(j.ImportDeclaration, {
		source: {
			value: '@ember/object',
		},
	});

	const importComputed = importDeclaration.find(j.ImportSpecifier, {
		imported: { name: 'computed' },
	});

	if (importComputed.size()) alreadyHasImport = true;

	root.find(j.CallExpression, {
		callee: {
			type: 'MemberExpression',
			object: { type: 'FunctionExpression' },
			property: { name: 'property' },
		},
	}).replaceWith((path) => {
		let computedImport = j.importDeclaration(
			[j.importSpecifier(j.identifier('computed'))],
			j.literal('@ember/object'),
		);

		if (!alreadyHasImport) {
			let body = root.get().value.program.body;

			body.unshift(computedImport);
			alreadyHasImport = true;
		}

		return j.callExpression(
			j.identifier('computed'),
			path.value.arguments.concat(path.value.callee.object),
		);
	});

	return root.toSource({ quote: 'single' });
}
