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
import type { Collection, ImportDeclaration } from 'jscodeshift';

export const addImport = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
	declaration: ImportDeclaration,
) => {
	const existingImports = root.find(j.ImportDeclaration);
	if (existingImports.length > 0) {
		const firstImport = existingImports.at(0);
		const firstImportNode = firstImport.nodes()[0];
		if (firstImportNode?.comments) {
			declaration.comments = firstImportNode.comments;
			firstImportNode.comments = null;
		}

		firstImport.insertBefore(declaration);
		return;
	}

	const firstNode = root.find(j.Program).get('body', 0).node;
	const { comments } = firstNode;
	if (comments?.length) {
		const comment = comments[0];

		// Only move comments that look like file-level comments. Ignore
		// line-level and JSDoc-style comments because these probably belong
		// to the first node, rather than the file.
		if (
			(comment.type === 'Block' || comment.type === 'CommentBlock') &&
			!comment.value.startsWith('*')
		) {
			declaration.comments = comments;
			firstNode.comments = null;
		}
	}

	root.get('program', 'body').unshift(declaration);
};
