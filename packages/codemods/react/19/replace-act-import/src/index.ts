import type { API, FileInfo, Options } from 'jscodeshift';

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);
	let isDirty = false;

	// Get default import from test utils
	let defaultUtilsImportName = root
		.find(j.ImportDeclaration, {
			source: { value: 'react-dom/test-utils' },
			specifiers: [{ type: 'ImportDefaultSpecifier' }],
		})
		.paths()
		.at(0)
		?.node.specifiers?.at(0)?.local?.name;

	// Get default import from test utils
	let starUtilsImportName = root
		.find(j.ImportDeclaration, {
			source: { value: 'react-dom/test-utils' },
			specifiers: [{ type: 'ImportNamespaceSpecifier' }],
		})
		.paths()
		.at(0)
		?.node.specifiers?.at(0)?.local?.name;

	let utilsCalleeName = defaultUtilsImportName ?? starUtilsImportName;
	let utilsCalleeType: any = defaultUtilsImportName
		? 'ImportDefaultSpecifier'
		: 'ImportNamespaceSpecifier';

	// For usages like `import * as ReactTestUtils from 'react-dom/test-utils'; ReactTestUtils.act()`
	let actAccessExpressions = root.find(j.MemberExpression, {
		object: { name: utilsCalleeName },
		property: { name: 'act' },
	});

	if (actAccessExpressions.length > 0) {
		// React import
		let defaultReactImportName = root
			.find(j.ImportDeclaration, { source: { value: 'react' } })
			.paths()
			.at(0)
			?.node.specifiers?.at(0)?.local?.name;

		if (!defaultReactImportName) {
			let importNode =
				utilsCalleeType === 'ImportDefaultSpecifier'
					? j.importDefaultSpecifier
					: j.importNamespaceSpecifier;

			let reactImport = j.importDeclaration(
				[importNode(j.identifier('React'))],
				j.literal('react'),
			);

			root.get().node.program.body.unshift(reactImport);
			isDirty = true;
		}

		actAccessExpressions.forEach((path) => {
			let accessedPath = j(path)
				.find(j.Identifier, { name: utilsCalleeName })
				.paths()
				.at(0);

			let newIdentifier = j.identifier.from({
				name: defaultReactImportName ?? 'React',
			});

			accessedPath?.replace(newIdentifier);
			isDirty = true;
		});

		// Remove the old import
		root.find(j.ImportDeclaration, {
			source: { value: 'react-dom/test-utils' },
			specifiers: [{ type: utilsCalleeType }],
		}).remove();

		isDirty = true;
	}

	root.find(j.ImportDeclaration, {
		source: { value: 'react-dom/test-utils' },
		specifiers: [{ type: 'ImportSpecifier', imported: { name: 'act' } }],
	}).forEach((path) => {
		let newImportSpecifier = j.importSpecifier(
			j.identifier('act'),
			j.identifier('act'),
		);

		let existingReactImportCollection = root.find(j.ImportDeclaration, {
			source: { value: 'react' },
			specifiers: [{ type: 'ImportSpecifier' }],
		});

		if (existingReactImportCollection.length > 0) {
			existingReactImportCollection
				.paths()
				.at(0)
				?.node.specifiers?.push(newImportSpecifier);

			path.prune();
			isDirty = true;
		} else {
			let newImportDeclaration = j.importDeclaration(
				[newImportSpecifier],
				j.literal('react'),
			);

			path.replace(newImportDeclaration);
			isDirty = true;
		}
	});

	/**
	 * handle re-exports:
	 * export * from 'react-dom/test-utils';
	 */
	root.find(j.ExportAllDeclaration).forEach((path) => {
		if (path.node.source.value === 'react-dom/test-utils') {
			let newExportDeclaration = j.exportNamedDeclaration.from({
				declaration: null,
				specifiers: [
					j.exportSpecifier.from({
						local: j.identifier('act'),
						exported: j.identifier('act'),
					}),
				],
				source: j.literal('react'),
			});

			// add export { act } from "react";
			path.insertAfter(newExportDeclaration);
			isDirty = true;
		}
	});

	return isDirty ? root.toSource() : undefined;
}
