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
	let j = api.jscodeshift;
	let root = j(file.source);

	let dirtyFlag = false;

	root.find(j.JSXElement, {
		openingElement: { name: { name: 'Router' } },
	}).forEach((path) => {
		let attrs = path.value.openingElement.attributes;

		if (!attrs) {
			return;
		}

		let hasHistoryAttr =
			attrs.filter((a) =>
				'name' in a ? a.name.name === 'history' : false,
			).length > 0;

		if (hasHistoryAttr) {
			let [historyAttr] = attrs.filter((a) =>
				'name' in a ? a.name.name === 'history' : false,
			);

			if (historyAttr && 'value' in historyAttr) {
				historyAttr.value = j.jsxExpressionContainer(
					j.identifier('history'),
				);

				dirtyFlag = true;
			}
		}

		let hasCreateHashHistoryImport =
			root.find(j.ImportDeclaration, {
				source: { value: 'history/createHashHistory' },
			}).length > 0;

		if (hasCreateHashHistoryImport) {
			return;
		}

		let computedImport = j.importDeclaration(
			[j.importDefaultSpecifier(j.identifier('createHashHistory'))],
			j.literal('history/createHashHistory'),
		);

		let body = root.get().value.program.body;
		body.unshift(computedImport);

		let vardecl = j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('history'),
				j.callExpression(j.identifier('createHashHistory'), []),
			),
		]);

		body.unshift(vardecl);

		dirtyFlag = true;
	});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

transform satisfies Transform;

export default transform;
