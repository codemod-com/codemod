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

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/utils/ast.js

Changes: move the code from JavaScript to TypeScript
*/

import type {
	ASTPath,
	Collection,
	JSCodeshift,
	JSXAttribute,
	TSParameterProperty,
} from 'jscodeshift';

export const createObjectProperty = function <T extends TSParameterProperty>(
	j: JSCodeshift,
	key: string,
	value: T,
) {
	return j.property('init', j.identifier(key), value);
};

export const createObjectExpression = function <T>(j: JSCodeshift, obj: T) {
	return j.objectExpression(
		// @ts-expect-error type ambiguity
		Object.entries(obj).map(([key, val]) =>
			// @ts-expect-error type ambiguity
			createObjectProperty(j, key, val),
		),
	);
};

export const getJSXAttributeValue = function (
	j: JSCodeshift,
	nodePath: ASTPath<JSXAttribute>,
) {
	// <Tag visible={1} />
	// 取出来 JSXExpressionContainer 其中值部分
	if (nodePath.value?.value?.type === 'JSXExpressionContainer') {
		return nodePath.value.value.expression;
	}

	// <Tag visible="1" />
	return nodePath.value.value;
};

export const findAllAssignedNames = <T>(
	root: Collection<T>,
	j: JSCodeshift,
	localAssignedName: string,
	localAssignedNames: string[] = [],
) => {
	const collection = root.find(j.VariableDeclarator, {
		init: {
			type: 'Identifier',
			name: localAssignedName,
		},
	});

	if (collection.length > 0) {
		collection.forEach((nodePath) => {
			// @ts-expect-error type ambiguity
			localAssignedNames.push(nodePath.node.id.name);
			findAllAssignedNames(
				root,
				j,
				// @ts-expect-error type ambiguity
				nodePath.node.id.name,
				localAssignedNames,
			);
		});
	}
	return localAssignedNames;
};
