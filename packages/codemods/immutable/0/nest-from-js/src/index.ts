/*! @license

MIT License

Copyright (c) 2020 QuintoAndar.com.br

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

import type {
	CallExpression,
	ObjectExpression,
	Property,
	Transform,
} from 'jscodeshift';

let hasValidArguments = (callExpression: CallExpression) => {
	return (
		callExpression.arguments.length === 1 &&
		callExpression.arguments[0] &&
		callExpression.arguments[0].type === 'ObjectExpression'
	);
};

let transform: Transform = (file, api) => {
	let j = api.jscodeshift;
	let root = j(file.source);
	let collections = root.find(j.CallExpression, {
		callee: {
			type: 'Identifier',
			name: 'fromJS',
		},
	});

	collections.forEach((path) => {
		if (hasValidArguments(path.node)) {
			let objectExpression = path.node.arguments[0] as ObjectExpression;

			objectExpression.properties.forEach((p) => {
				let property = p as Property;

				if (property.value.type === 'Literal') {
					let literal = property.value as any;

					if (literal.raw) {
						return;
					}
				}

				property.value = j.callExpression(j.identifier('fromJS'), [
					property.value as any,
				]);
			});

			path.replace(objectExpression);
		}
	});

	return root.toSource();
};

export default transform;
