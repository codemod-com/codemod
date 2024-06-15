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

The source code has been taken from https://raw.githubusercontent.com/ant-design/codemod-v5/main/transforms/v5-remove-style-import.js

Changes: migrate imports from cjs to esm
*/

import { parseStrToArray, printOptions } from '@codemod-com/antd5-utils';

// handle forked antd
let commentOutStyleImport = [
	// antd/es/auto-complete/style
	/(es|lib)\/.+\/style.*/,
	// antd/dist/antd.compact.min.css
	/dist\/.+\.(less|css)/,
];

let transform = (file, api, options) => {
	let j = api.jscodeshift;
	let root = j(file.source);
	let antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

	// import 'antd/es/auto-complete/style';
	// import 'antd/dist/antd.compact.min.css';
	function removeStyleImport(j, root) {
		let hasChanged = false;

		let regexList = antdPkgNames
			.map((antdPkg) => {
				return new RegExp(
					[
						antdPkg,
						`(${commentOutStyleImport.map((re) => re.source).join('|')})`,
					].join('/'),
				);
			})
			.concat(
				// import '@ant-design/compatible/assets/index.css';
				new RegExp('@ant-design/compatible/assets/index\\.css'),
			);

		// import { Comment, PageHeader } from 'antd';
		// import { Comment, PageHeader } from '@forked/antd';
		root.find(j.ImportDeclaration)
			.filter(
				(path) =>
					path.node.source.type === 'StringLiteral' &&
					regexList.some((re) => re.test(path.node.source.value)),
			)
			.forEach((path) => {
				hasChanged = true;
				j(path).replaceWith((path) => {
					// 不加空行会导致无法执行 root.toSource()
					let empty = j.emptyStatement();
					// add indent
					empty.comments = [
						j.commentLine(` ${j(path.node).toSource()}`),
					];
					return empty;
				});
			});

		return hasChanged;
	}

	// step1. import deprecated components from '@ant-design/compatible'
	// step2. cleanup antd import if empty
	let hasChanged = false;
	hasChanged = removeStyleImport(j, root) || hasChanged;

	return hasChanged
		? root.toSource(options.printOptions || printOptions)
		: null;
};

export default transform;
