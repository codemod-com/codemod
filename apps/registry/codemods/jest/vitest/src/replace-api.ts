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
import type { Collection, Identifier } from 'jscodeshift';

const jestFailsApisName = 'failing';
const vitestFailsApisName = 'fails';

export const replaceTestApiFailing = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
): void => {
	for (const testApiName of ['it', 'test']) {
		// Replace `(it|test).failing` with `(it|test).fails`
		root.find(j.MemberExpression, {
			object: { type: 'Identifier', name: testApiName },
			property: { type: 'Identifier', name: jestFailsApisName },
		}).forEach((path) => {
			(path.node.property as Identifier).name = vitestFailsApisName;
		});

		// Replace `(it|test).(only|skip).failing` with `(it|test).(only|skip).fails`
		for (const testApiModifierName of ['only', 'skip']) {
			root.find(j.MemberExpression, {
				object: {
					object: { type: 'Identifier', name: testApiName },
					property: {
						type: 'Identifier',
						name: testApiModifierName,
					},
				},
				property: { type: 'Identifier', name: jestFailsApisName },
			}).forEach((path) => {
				(path.node.property as Identifier).name = vitestFailsApisName;
			});
		}
	}
};

export const replaceTestApiFit = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
): void => {
	const jestApiName = 'fit';
	const vitestApiObject = j.memberExpression(
		j.identifier('it'),
		j.identifier('only'),
	);

	// Replace `fit` with `it.only`
	root.find(j.CallExpression, {
		callee: { type: 'Identifier', name: jestApiName },
	}).forEach((path) => {
		path.node.callee = vitestApiObject;
	});

	// Replace `fit.(each|failing)` with `it.only.(each|failing)`
	for (const fitModifierName of ['each', 'failing']) {
		root.find(j.MemberExpression, {
			object: { type: 'Identifier', name: jestApiName },
			property: { type: 'Identifier', name: fitModifierName },
		}).forEach((path) => {
			path.node.object = vitestApiObject;
		});
	}
};
