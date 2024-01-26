/*! @license
MIT LICENSE

Copyright (c) 2015-present Ant UED, https://xtech.antfin.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/v5-removed-static-method-migration.js
Changes to the original file: changed imports to esm 
*/

import {
	findAllAssignedNames,
	parseStrToArray,
	printOptions,
} from '@codemod-com/antd5-utils';

const changedApiMap = {
	message: {
		hook: 'useMessage',
		replace: {
			warn: 'warning',
		},
	},
	notification: {
		hook: 'useNotification',
		replace: {
			close: 'destroy',
		},
	},
};

const transform = (file, api, options) => {
	const j = api.jscodeshift;
	const root = j(file.source);
	const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

	function replaceDeconstructionAssignCall(msgApiName, importedName) {
		const changedApiConfig = changedApiMap[importedName]?.replace;
		if (changedApiConfig) {
			Object.entries(changedApiConfig).forEach(([oldName, newName]) => {
				// msgApi.warn => msgApi.warning
				root.find(j.CallExpression, {
					callee: {
						type: 'MemberExpression',
						object: {
							type: 'Identifier',
							name: msgApiName,
						},
						property: {
							type: 'Identifier',
							name: oldName,
						},
					},
				}).forEach((path) => {
					path.node.callee.property.name = newName;
				});
			});
		}
	}

	function replaceCallWithIndexZero(aliasedApiName, importedName) {
		const changedApiConfig = changedApiMap[importedName]?.replace;
		if (changedApiConfig) {
			Object.entries(changedApiConfig).forEach(([, newName]) => {
				// msgNamespace[0].warn => msgNamespace[0].warning
				root.find(j.CallExpression, {
					callee: {
						type: 'MemberExpression',
						object: {
							type: 'MemberExpression',
							object: {
								type: 'Identifier',
								name: aliasedApiName,
							},
							property: {
								type: 'NumericLiteral',
								value: 0,
							},
						},
					},
				}).forEach((path) => {
					path.node.callee.property.name = newName;
				});
			});
		}
	}

	function replaceMessageCall(path, importedName) {
		// const [messageApi, contextHolder] = messageAlias;
		if (path.node.id.type === 'ArrayPattern') {
			const msgApiName = path.node.id.elements[0].name;
			// 处理反复 reassign 的场景
			const localAssignedNames = findAllAssignedNames(
				root,
				j,
				msgApiName,
				[msgApiName],
			);

			localAssignedNames.forEach((apiName) => {
				replaceDeconstructionAssignCall(apiName, importedName);
				hasChanged = true;
			});
		} else if (path.node.id.type === 'Identifier') {
			// const msg = msg;
			// 处理反复 reassign 的场景
			const msgName = path.node.id.name;
			const localAssignedNames = findAllAssignedNames(root, j, msgName, [
				msgName,
			]);

			localAssignedNames.forEach((apiName) => {
				// const [api] = msg;
				root.find(j.VariableDeclarator, {
					init: {
						type: 'Identifier',
						name: apiName,
					},
				}).forEach((path) => {
					replaceMessageCall(path, importedName);
					hasChanged = true;
				});

				replaceCallWithIndexZero(apiName, importedName);
			});
		}
	}

	// rename old Message.warn() calls to Message.warning()
	function renameMessageWarnMethodCalls(j, root) {
		let hasChanged = false;
		root.find(j.Identifier)
			.filter(
				(path) =>
					Object.keys(changedApiMap).includes(path.node.name) &&
					path.parent.node.type === 'ImportSpecifier' &&
					antdPkgNames.includes(path.parent.parent.node.source.value),
			)
			.forEach((path) => {
				const importedName = path.parent.node.imported.name;
				const localComponentName = path.parent.node.local.name;
				// message.warn -> message.warning
				replaceDeconstructionAssignCall(
					localComponentName,
					importedName,
				);
				hasChanged = true;

				// useMessage called()
				// const [messageApi, contextHolder] = message.useMessage();
				// const msg = message.useMessage();
				const hook = changedApiMap[importedName]?.hook;
				if (hook) {
					root.find(j.VariableDeclarator, {
						init: {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								property: {
									type: 'Identifier',
									name: hook,
								},
							},
						},
					}).forEach((path) => {
						replaceMessageCall(path, importedName);
					});
				}
			});

		return hasChanged;
	}

	// step1. // rename old Model.method() calls
	// step2. cleanup antd import if empty
	let hasChanged = false;
	hasChanged = renameMessageWarnMethodCalls(j, root) || hasChanged;

	return hasChanged
		? root.toSource(options.printOptions || printOptions)
		: null;
};

export default transform;
