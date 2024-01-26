/*! @license

The MIT License (MIT)

Copyright (c) 2023 Vercel, Inc.

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

Changes to the original file: simplify replaceWith statements, add dirtyFlag mechanics
*/

import type { API, FileInfo, Options, Transform } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options) {
	const j = api.jscodeshift.withParser('tsx');
	const root = j(file.source);

	let dirtyFlag = false;

	root.find(j.ImportDeclaration, {
		source: { value: '@next/font' },
	}).forEach((importDeclarationPath) => {
		dirtyFlag = true;

		importDeclarationPath.node.source = j.stringLiteral('next/font');
	});

	// Before: import { ... } from '@next/font/google'
	// After: import { ... } from 'next/font/google'
	root.find(j.ImportDeclaration, {
		source: { value: '@next/font/google' },
	}).forEach((importDeclarationPath) => {
		dirtyFlag = true;

		importDeclarationPath.node.source = j.stringLiteral('next/font/google');
	});

	// Before: import localFont from '@next/font/local'
	// After: import localFont from 'next/font/local'
	root.find(j.ImportDeclaration, {
		source: { value: '@next/font/local' },
	}).replaceWith((importDeclarationPath) => {
		dirtyFlag = true;

		importDeclarationPath.node.source = j.stringLiteral('next/font/local');
	});

	return dirtyFlag ? root.toSource(options) : undefined;
}

transform satisfies Transform;
