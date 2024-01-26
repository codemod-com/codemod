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

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/v5-removed-component-migration.js
Changes to the original file: 
1. changed imports to esm 
2. commented out markDependency
*/

import {
	addSubmoduleImport,
	parseStrToArray,
	printOptions,
	removeEmptyModuleImport,
} from '@codemod-com/antd5-utils';

// import { markDependency } from '@codemod-com/antd5-utils/marker';

const removedComponentConfig = {
	Comment: {
		importSource: '@ant-design/compatible',
	},
	PageHeader: {
		importSource: '@ant-design/pro-layout',
	},
	BackTop: {
		importSource: 'antd',
		rename: 'FloatButton.BackTop',
	},
};

const transform = (file, api, options) => {
	const j = api.jscodeshift;
	const root = j(file.source);
	const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

	// import { Comment } from '@ant-design/compatible'
	// import { PageHeader } from '@ant-design/pro-components'
	function importDeprecatedComponent(j, root) {
		let hasChanged = false;

		// import { Comment, PageHeader } from 'antd';
		// import { Comment, PageHeader } from '@forked/antd';
		const componentNameList = Object.keys(removedComponentConfig);

		root.find(j.Identifier)
			.filter(
				(path) =>
					componentNameList.includes(path.node.name) &&
					path.parent.node.type === 'ImportSpecifier' &&
					antdPkgNames.includes(path.parent.parent.node.source.value),
			)
			.forEach((path) => {
				hasChanged = true;
				const importedComponentName = path.parent.node.imported.name;
				const antdPkgName = path.parent.parent.node.source.value;

				// remove old imports
				const importDeclaration = path.parent.parent.node;
				importDeclaration.specifiers =
					importDeclaration.specifiers.filter(
						(specifier) =>
							!specifier.imported ||
							specifier.imported.name !== importedComponentName,
					);

				// add new import from '@ant-design/compatible'
				const localComponentName = path.parent.node.local.name;
				const importConfig =
					removedComponentConfig[importedComponentName];
				if (importConfig.rename) {
					if (importConfig.rename.includes('.')) {
						// `FloatButton.BackTop`
						const [newComponentName, compoundComponentName] =
							importConfig.rename.split('.');
						// import part
						const importedLocalName = addSubmoduleImport(j, root, {
							moduleName: importConfig.importSource,
							importedName: newComponentName,
							before: antdPkgName,
						});
						// rename part
						root.find(j.JSXElement, {
							openingElement: {
								name: { name: localComponentName },
							},
						}).forEach((path) => {
							path.node.openingElement.name =
								j.jsxMemberExpression(
									j.jsxIdentifier(importedLocalName),
									j.jsxIdentifier(compoundComponentName),
								);
						});
					}
				} else {
					addSubmoduleImport(j, root, {
						moduleName: importConfig.importSource,
						importedName: importedComponentName,
						localName: localComponentName,
						before: antdPkgName,
					});
					// markDependency(importConfig.importSource);
				}
			});

		return hasChanged;
	}

	// step1. import deprecated components from '@ant-design/compatible'
	// step2. cleanup antd import if empty
	let hasChanged = false;
	hasChanged = importDeprecatedComponent(j, root) || hasChanged;

	if (hasChanged) {
		antdPkgNames.forEach((antdPkgName) => {
			removeEmptyModuleImport(j, root, antdPkgName);
		});
	}

	return hasChanged
		? root.toSource(options.printOptions || printOptions)
		: null;
};

export default transform;
