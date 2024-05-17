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

Changes to the original file: added options
*/

import type { Transform } from 'jscodeshift';

let transform: Transform = (file, api, options) => {
	let j = api.jscodeshift;

	let root = j(file.source);
	let immutableImports = root.find(j.ImportDeclaration, {
		source: {
			value: 'immutable',
		},
	});

	if (immutableImports.length > 0) {
		let deprecationMessage = [
			j.commentLine(' ImmutableJS usage is deprecated', true, false),
			j.commentLine(
				' Please, do not copy & paste or use this snippet as reference :)',
				true,
				false,
			),
			j.commentLine(
				' How to refactor? See https://github.com/quintoandar/farewell-immutablejs/blob/master/MIGRATION.md',
				true,
				false,
			),
		];

		// Attach message before first Immutable import
		immutableImports.at(0).forEach((p) => {
			let comments = (p.node.comments = p.node.comments || []);
			comments.push(...deprecationMessage);
		});
	}

	return root.toSource(options);
};

export default transform;
