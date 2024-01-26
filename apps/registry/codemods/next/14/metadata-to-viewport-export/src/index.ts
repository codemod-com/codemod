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

export default function transform(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);

	let dirtyFlag = false;

	// Find the metadata export
	const metadataExport = root.find(j.ExportNamedDeclaration, {
		declaration: {
			type: 'VariableDeclaration',
			declarations: [
				{
					id: { name: 'metadata' },
				},
			],
		},
	});

	if (metadataExport.size() !== 1) {
		return;
	}

	const metadataObject = metadataExport.find(j.ObjectExpression).get(0).node;
	if (!metadataObject) {
		console.error('Could not find metadata object');
		return;
	}

	let metadataProperties = metadataObject.properties;
	let viewportProperties;

	const viewport = metadataProperties.find(
		(prop: { key: { name: string } }) => prop.key.name === 'viewport',
	);
	if (viewport) {
		viewportProperties = viewport.value.properties;
		metadataProperties = metadataProperties.filter(
			(prop: { key: { name: string } }) => prop.key.name !== 'viewport',
		);
	} else {
		viewportProperties = [];
	}

	const colorScheme = metadataProperties.find(
		(prop: { key: { name: string } }) => prop.key.name === 'colorScheme',
	);
	if (colorScheme) {
		viewportProperties.push(colorScheme);
		metadataProperties = metadataProperties.filter(
			(prop: { key: { name: string } }) =>
				prop.key.name !== 'colorScheme',
		);
	}

	const themeColor = metadataProperties.find(
		(prop: { key: { name: string } }) => prop.key.name === 'themeColor',
	);
	if (themeColor) {
		viewportProperties.push(themeColor);
		metadataProperties = metadataProperties.filter(
			(prop: { key: { name: string } }) => prop.key.name !== 'themeColor',
		);
	}

	// Update the metadata export
	metadataExport
		.find(j.ObjectExpression)
		.replaceWith(j.objectExpression(metadataProperties));

	// Create the new viewport object
	const viewportExport = j.exportNamedDeclaration(
		j.variableDeclaration('const', [
			j.variableDeclarator(
				j.identifier('viewport'),
				j.objectExpression(viewportProperties),
			),
		]),
	);

	// Append the viewport export to the body of the program
	if (viewportProperties.length) {
		root.get().node.program.body.push(viewportExport);
		dirtyFlag = true;
	}

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource();
}
