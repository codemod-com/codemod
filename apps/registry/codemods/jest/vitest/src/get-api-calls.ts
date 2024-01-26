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

const jestGlobalApis = [
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

const testApiProps = ['concurrent', 'each', 'only', 'skip', 'todo', 'failing'];
const jestGlobalApiProps = {
	describe: ['each', 'only', 'skip'],
	fit: ['each', 'failing'],
	it: testApiProps,
	test: testApiProps,
};

const jestToVitestApiMap: Record<string, string> = {
	fit: 'it',
	jest: 'vi',
};

export const getApisFromMemberExpression = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
): string[] => {
	const apisFromMemberExpression = [];

	for (const [jestApi, jestApiProps] of Object.entries(jestGlobalApiProps)) {
		const propNamesList = root
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

		const propNames = [...new Set(propNamesList)];
		for (const propName of propNames) {
			if (jestApiProps.includes(propName)) {
				apisFromMemberExpression.push(
					jestToVitestApiMap[jestApi] ?? jestApi,
				);
				break;
			}
		}
	}

	const jestObjectName = 'jest';
	const jestObjectApiCalls = root
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

export const getApisFromCallExpression = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
): string[] => {
	const apisFromCallExpression = [];

	for (const jestGlobalApi of jestGlobalApis) {
		const calls = root.find(j.CallExpression, {
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
