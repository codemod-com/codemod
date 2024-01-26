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
*/

import type { API, FileInfo, Options } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options) {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Before: import Image from "next/image"
	//  After: import Image from "next/legacy/image"
	root.find(j.ImportDeclaration, {
		source: { value: 'next/image' },
	}).forEach((importDeclarationPath) => {
		importDeclarationPath.node.source =
			j.stringLiteral('next/legacy/image');
	});
	// Before: const Image = await import("next/image")
	//  After: const Image = await import("next/legacy/image")
	root.find(j.ImportExpression, {
		source: { value: 'next/image' },
	}).forEach((importExpressionPath) => {
		importExpressionPath.node.source = j.stringLiteral('next/legacy/image');
	});

	// Before: import Image from "next/future/image"
	//  After: import Image from "next/image"
	root.find(j.ImportDeclaration, {
		source: { value: 'next/future/image' },
	}).forEach((importDeclarationPath) => {
		importDeclarationPath.node.source = j.stringLiteral('next/image');
	});

	// Before: const Image = await import("next/future/image")
	//  After: const Image = await import("next/image")
	root.find(j.ImportExpression, {
		source: { value: 'next/future/image' },
	}).forEach((importExpressionPath) => {
		importExpressionPath.node.source = j.stringLiteral('next/image');
	});

	// Before: const Image = require("next/image")
	//  After: const Image = require("next/legacy/image")
	root.find(j.CallExpression).forEach((requireExp) => {
		if (
			requireExp?.value?.callee?.type === 'Identifier' &&
			requireExp.value.callee.name === 'require'
		) {
			const firstArg = requireExp.value.arguments[0];
			if (
				firstArg &&
				firstArg.type === 'Literal' &&
				firstArg.value === 'next/image'
			) {
				requireExp.value.arguments[0] = j.literal('next/legacy/image');
			}
		}
	});

	// Before: const Image = require("next/future/image")
	//  After: const Image = require("next/image")
	root.find(j.CallExpression).forEach((requireExp) => {
		if (
			requireExp?.value?.callee?.type === 'Identifier' &&
			requireExp.value.callee.name === 'require'
		) {
			const firstArg = requireExp.value.arguments[0];
			if (
				firstArg &&
				firstArg.type === 'Literal' &&
				firstArg.value === 'next/future/image'
			) {
				requireExp.value.arguments[0] = j.literal('next/image');
			}
		}
	});

	// Learn more about renaming an import declaration here:
	// https://www.codeshiftcommunity.com/docs/import-manipulation/#replacerename-an-import-declaration

	return root.toSource(options);
}
