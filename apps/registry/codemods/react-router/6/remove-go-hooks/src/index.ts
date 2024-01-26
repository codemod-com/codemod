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

	// Rename useHistory import to useNavigate
	root.find(j.ImportDeclaration)
		.filter((i) => {
			return (
				i.value.specifiers?.some((s) =>
					'imported' in s ? s.imported.name === 'useHistory' : false,
				) ?? false
			);
		})
		.forEach((path) => {
			const [oldSpec] =
				path.value.specifiers?.filter((s) =>
					'imported' in s ? s.imported.name === 'useHistory' : false,
				) ?? [];

			if (oldSpec && 'imported' in oldSpec) {
				oldSpec.imported.name = 'useNavigate';

				dirtyFlag = true;
			}
		});

	root.find(j.VariableDeclarator, {
		init: { callee: { name: 'useHistory' } },
	}).forEach((path) => {
		if (
			path.value.init &&
			'callee' in path.value.init &&
			'name' in path.value.init.callee
		) {
			path.value.init.callee.name = 'useNavigate';

			dirtyFlag = true;
		}

		if ('properties' in path.value.id) {
			const prop = j.objectProperty(
				j.identifier('navigate'),
				j.identifier('navigate'),
			);
			path.value.id.properties = [prop];

			dirtyFlag = true;
		}
	});

	root.find(j.CallExpression, { callee: { name: 'go' } }).forEach((path) => {
		if ('name' in path.value.callee) {
			path.value.callee.name = 'navigate';

			dirtyFlag = true;
		}
	});

	root.find(j.JSXExpressionContainer)
		.filter((path) =>
			'name' in path.value.expression
				? path.value.expression.name === 'goBack'
				: false,
		)
		.forEach((path) => {
			path.value.expression = j.arrowFunctionExpression(
				[],
				j.callExpression(j.identifier('navigate'), [j.literal(-1)]),
			);

			dirtyFlag = true;
		});

	root.find(j.JSXExpressionContainer)
		.filter((path) =>
			'name' in path.value.expression
				? path.value.expression.name === 'goForward'
				: false,
		)
		.forEach((path) => {
			path.value.expression = j.arrowFunctionExpression(
				[],
				j.callExpression(j.identifier('navigate'), [j.literal(1)]),
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
