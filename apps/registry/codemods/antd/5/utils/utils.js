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

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/utils/index.js
*/

// some utils extract from https://github.com/reactjs/react-codemod
function insertImportAfter(j, root, { importStatement, afterModule }) {
	const firstAfterModuleImport = root
		.find(j.ImportDeclaration, {
			source: { value: afterModule },
		})
		.at(0);

	if (firstAfterModuleImport.paths()[0]) {
		firstAfterModuleImport.insertAfter(importStatement);
	} else {
		// 保留首行的注释
		// https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
		const firstNode = getFirstNode(j);
		const { comments } = firstNode;
		if (comments) {
			delete firstNode.comments;
			importStatement.comments = comments;
		}

		// insert `import` at body(0)
		root.get().node.program.body.unshift(importStatement);
	}
}

function insertImportBefore(j, root, { importStatement, beforeModule }) {
	const firstBeforeModuleImport = root
		.find(j.ImportDeclaration, {
			source: { value: beforeModule },
		})
		.at(0);

	const firstNode = getFirstNode(j, root);
	if (
		(firstBeforeModuleImport.paths()[0] &&
			firstBeforeModuleImport.paths()[0].node === firstNode) ||
		!firstBeforeModuleImport
	) {
		// 保留首行的注释
		// https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
		const { comments } = firstNode;
		if (comments) {
			delete firstNode.comments;
			importStatement.comments = comments;
		}
	}

	if (firstBeforeModuleImport) {
		firstBeforeModuleImport.insertBefore(importStatement);
	} else {
		// insert `import` at body(0)
		root.get().node.program.body.unshift(importStatement);
	}
}

function hasSubmoduleImport(j, root, moduleName, submoduleName) {
	const collections = root
		.find(j.ImportDeclaration, {
			source: {
				value: moduleName,
			},
		})
		.find(j.ImportSpecifier, {
			imported: {
				name: submoduleName,
			},
		});

	const targetImport = collections.paths();

	// local 默认设置为 null
	return (
		targetImport[0]?.value?.local?.name ||
		targetImport[0]?.value?.imported.name
	);
}

function hasModuleImport(j, root, moduleName) {
	return (
		root.find(j.ImportDeclaration, {
			source: { value: moduleName },
		}).length > 0
	);
}

function hasModuleDefaultImport(j, root, pkgName, localModuleName) {
	let found = false;
	root.find(j.ImportDeclaration, {
		source: { value: pkgName },
	}).forEach((nodePath) => {
		const defaultImport = nodePath.node.specifiers.filter(
			(n) =>
				n.type === 'ImportDefaultSpecifier' &&
				n.local.name === localModuleName,
		);
		if (defaultImport.length) {
			found = true;
		}
	});
	return found;
}

function removeEmptyModuleImport(j, root, moduleName) {
	root.find(j.ImportDeclaration)
		.filter(
			(path) =>
				path.node.specifiers.length === 0 &&
				path.node.source.value === moduleName,
		)
		.replaceWith();
}

// Program uses var keywords
function useVar(j, root) {
	return root.find(j.VariableDeclaration, { kind: 'const' }).length === 0;
}

function getFirstNode(j, root) {
	return root.find(j.Program).get('body', 0).node;
}

function addModuleImport(j, root, { pkgName, importSpecifier, before }) {
	// if has module imported, just import new submodule from existed
	// else just create a new import
	if (hasModuleImport(j, root, pkgName)) {
		root.find(j.ImportDeclaration, {
			source: { value: pkgName },
		})
			.at(0)
			.replaceWith(({ node }) => {
				const mergedImportSpecifiers = node.specifiers
					.concat(importSpecifier)
					.sort((a, b) => {
						if (a.type === 'ImportDefaultSpecifier') {
							return -1;
						}

						if (b.type === 'ImportDefaultSpecifier') {
							return 1;
						}

						return a.imported.name.localeCompare(b.imported.name);
					});
				return j.importDeclaration(
					mergedImportSpecifiers,
					j.literal(pkgName),
				);
			});
		return true;
	}

	const importStatement = j.importDeclaration(
		[importSpecifier],
		j.literal(pkgName),
	);

	insertImportBefore(j, root, { importStatement, beforeModule: before });
	return true;
}

// add default import before one module
function addModuleDefaultImport(j, root, { moduleName, localName, before }) {
	if (hasModuleDefaultImport(j, root, moduleName, localName)) {
		return;
	}

	// DefaultImportSpecifier
	const importSpecifier = j.importDefaultSpecifier(j.identifier(localName));

	if (
		addModuleImport(j, root, {
			pkgName: moduleName,
			importSpecifier,
			before,
		})
	) {
		return;
	}

	throw new Error(`No ${moduleName} import found!`);
}

// add submodule import before one module
function addSubmoduleImport(
	j,
	root,
	{ moduleName, importedName, localName, before },
) {
	const importedLocalName = hasSubmoduleImport(
		j,
		root,
		moduleName,
		importedName,
	);
	if (importedLocalName) {
		return importedLocalName;
	}

	const importSpecifier = j.importSpecifier(
		j.identifier(importedName),
		localName ? j.identifier(localName) : null,
	);

	if (
		addModuleImport(j, root, {
			pkgName: moduleName,
			importSpecifier,
			before,
		})
	) {
		return localName || importedName;
	}

	throw new Error(`No ${moduleName} import found!`);
}

// add style import after one module
function addStyleModuleImport(j, root, { moduleName, after }) {
	if (hasModuleImport(j, root, moduleName)) {
		return;
	}

	const importStatement = j.importDeclaration([], j.literal(moduleName));
	insertImportAfter(j, root, { importStatement, afterModule: after });
}

function parseStrToArray(antdPkgNames) {
	return (antdPkgNames || '')
		.split(',')
		.filter((n) => n)
		.map((n) => n.trim());
}

export {
	parseStrToArray,
	addModuleDefaultImport,
	addStyleModuleImport,
	addSubmoduleImport,
	removeEmptyModuleImport,
	useVar,
};
