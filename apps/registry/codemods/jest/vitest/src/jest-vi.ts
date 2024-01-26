/*! @license
MIT License

Copyright (c) 2023 Trivikram Kamat

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

import type core from 'jscodeshift';
import type { Collection } from 'jscodeshift';

const apiNamesRecord: Record<string, string> = {
	createMockFromModule: 'importMock',
	deepUnmock: 'unmock',
	genMockFromModule: 'importMock',
	requireActual: 'importActual',
	requireMock: 'importMock',
	setMock: 'mock',
};
const apiNamesToMakeAsync = [
	'genMockFromModule',
	'createMockFromModule',
	'requireActual',
	'requireMock',
];

// Replace `jest` with `vi`
export const replaceJestObjectWithVi = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
): void => {
	root.find(j.MemberExpression, {
		object: { type: 'Identifier', name: 'jest' },
	}).forEach((path) => {
		if (!j.Identifier.check(path.node.property)) {
			return;
		}

		const propertyName = path.node.property.name;

		if (propertyName === 'enableAutomock') {
			throw new Error(
				`The automocking API "${propertyName}" is not supported in vitest.\n` +
					'See https://vitest.dev/guide/migration.html',
			);
		}

		if (propertyName === 'disableAutomock') {
			j(path.parentPath).remove();
			return;
		}

		if (apiNamesRecord[propertyName]) {
			path.node.property.name = apiNamesRecord[propertyName];
		}

		if (apiNamesToMakeAsync.includes(propertyName)) {
			// Add await to the call expression
			j(path.parentPath).replaceWith((path) =>
				j.awaitExpression(path.value),
			);

			// Add async to the function
			let parentPath = path.parentPath;
			while (
				!['FunctionExpression', 'ArrowFunctionExpression'].includes(
					parentPath.value.type,
				)
			) {
				parentPath = parentPath.parentPath;
			}
			parentPath.value.async = true;
		}

		path.node.object = j.identifier('vi');
	});
};
