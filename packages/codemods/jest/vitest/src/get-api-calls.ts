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

let jestGlobalApis = [
	'afterAll',
	'afterEach',
	'beforeAll',
	'beforeEach',
	'describe',
	'test',
	'it',
	'fit',
	'expect',
];

let testApiProps = ['concurrent', 'each', 'only', 'skip', 'todo', 'failing'];
let jestGlobalApiProps = {
	describe: ['each', 'only', 'skip'],
	fit: ['each', 'failing'],
	it: testApiProps,
	test: testApiProps,
};

let jestToVitestApiMap: Record<string, string> = {
	fit: 'it',
	jest: 'vi',
};

export let getApisFromMemberExpression = <T,>(
	root: Collection<T>,
	j: core.JSCodeshift,
): string[] => {
	let apisFromMemberExpression = [];

	for (let [jestApi, jestApiProps] of Object.entries(jestGlobalApiProps)) {
		let propNamesList = root
			.find(j.MemberExpression, {
				object: { name: jestApi },
				property: { type: 'Identifier' },
			})
			.nodes()
			.map(
				(node) =>
					j.Identifier.check(node.property) && node.property.name,
			)
			.filter(Boolean) as string[];

		let propNames = [...new Set(propNamesList)];
		for (let propName of propNames) {
			if (jestApiProps.includes(propName)) {
				apisFromMemberExpression.push(
					jestToVitestApiMap[jestApi] ?? jestApi,
				);
				break;
			}
		}
	}

	let jestObjectName = 'jest';
	let jestObjectApiCalls = root
		.find(j.MemberExpression, {
			object: { name: jestObjectName },
			property: { type: 'Identifier' },
		})
		.filter(
			(path) =>
				j.Identifier.check(path.node.property) &&
				path.node.property.name !== 'disableAutomock',
		);

	if (jestObjectApiCalls.length) {
		apisFromMemberExpression.push(
			jestToVitestApiMap[jestObjectName] ?? jestObjectName,
		);
	}

	return apisFromMemberExpression;
};

export let getApisFromCallExpression = <T,>(
	root: Collection<T>,
	j: core.JSCodeshift,
): string[] => {
	let apisFromCallExpression = [];

	for (let jestGlobalApi of jestGlobalApis) {
		let calls = root.find(j.CallExpression, {
			callee: { name: jestGlobalApi },
		});

		if (calls.length > 0) {
			apisFromCallExpression.push(
				jestGlobalApi !== 'fit' ? jestGlobalApi : 'it',
			);
		}
	}

	return apisFromCallExpression;
};
