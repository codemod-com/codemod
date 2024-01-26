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

/*
Changes to the original file: add any typings in places where the compiler complained, added dirtyFlag
*/

import type { API, FileInfo } from 'jscodeshift';

const importToChange = 'ImageResponse';

export default function transform(file: FileInfo, api: API) {
	const j = api.jscodeshift;

	let dirtyFlag = false;

	// Find import declarations that match the pattern
	file.source = j(file.source)
		.find(j.ImportDeclaration, {
			source: {
				value: 'next/server',
			},
		})
		.forEach((path) => {
			const importSpecifiers = path.node.specifiers;
			// @ts-expect-error nullability
			const importNamesToChange = importSpecifiers.filter(
				// @ts-expect-error nullability
				(specifier) => specifier.local.name === importToChange,
			);
			// @ts-expect-error nullability
			const importsNamesRemained = importSpecifiers.filter(
				// @ts-expect-error nullability
				(specifier) => specifier.local.name !== importToChange,
			);

			// If the import includes the specified import name, create a new import for it from 'next/og'

			if (importNamesToChange.length > 0) {
				// Replace the original import with the remaining specifiers
				// path.node.specifiers = remainingSpecifiers
				const newImportStatement = j.importDeclaration(
					importNamesToChange,
					j.stringLiteral('next/og'),
				);
				path.insertBefore(newImportStatement);
				dirtyFlag = true;
			}
			if (importsNamesRemained.length > 0) {
				// @ts-expect-error nullability
				const remainingSpecifiers = importSpecifiers.filter(
					// @ts-expect-error nullability
					(specifier) => specifier.local.name !== importToChange,
				);

				const nextServerRemainImportsStatement = j.importDeclaration(
					remainingSpecifiers,
					j.stringLiteral('next/server'),
				);
				path.insertBefore(nextServerRemainImportsStatement);
				dirtyFlag = true;
			}
			j(path).remove();
		})
		.toSource();

	if (!dirtyFlag) {
		return undefined;
	}

	return file.source;
}
