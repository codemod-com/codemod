import type { ImportSpecifier, SourceFile } from 'ts-morph';

function addNamedImportDeclaration(
	sourceFile: SourceFile,
	moduleSpecifier: string,
	name: string,
): ImportSpecifier {
	let importDeclaration =
		sourceFile.getImportDeclaration(moduleSpecifier) ??
		sourceFile.addImportDeclaration({ moduleSpecifier });

	let existing = importDeclaration
		.getNamedImports()
		.find((specifier) => specifier.getName() === name);

	return existing ?? importDeclaration.addNamedImport({ name });
}

function aliasAwareRename(specifier: ImportSpecifier, name: string) {
	if (specifier.getAliasNode()) {
		specifier.getNameNode().replaceWithText(name);
	} else {
		specifier.getNameNode().rename(name);
	}

	return specifier;
}

function shouldProcessFile(sourceFile: SourceFile): boolean {
	return (
		sourceFile
			.getImportDeclarations()
			.find((decl) =>
				decl.getModuleSpecifier().getLiteralText().startsWith('msw'),
			) !== undefined
	);
}

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
	if (!shouldProcessFile(sourceFile)) {
		return undefined;
	}

	sourceFile
		.getImportDeclarations()
		.filter((d) => d.getModuleSpecifierValue() === 'msw')
		.forEach((declaration) => {
			// https://mswjs.io/docs/migrations/1.x-to-2.x/#worker-imports
			let setupWorkerImport = declaration
				.getNamedImports()
				.find((specifier) => specifier.getName() === 'setupWorker');

			if (setupWorkerImport) {
				setupWorkerImport.remove();
				if (!declaration.getNamedImports().length) {
					declaration.remove();
				}

				addNamedImportDeclaration(
					sourceFile,
					'msw/browser',
					'setupWorker',
				);
			}

			if (declaration.wasForgotten()) {
				return;
			}

			// https://mswjs.io/docs/migrations/1.x-to-2.x/#response-resolver-arguments (only the import names)
			declaration
				.getNamedImports()
				.filter((specifier) =>
					['rest', 'RestHandler'].includes(specifier.getName()),
				)
				.forEach((specifier) => {
					let importName = specifier.getName();
					aliasAwareRename(
						specifier,
						importName === 'rest' ? 'http' : 'HttpHandler',
					);
				});
		});

	return sourceFile.getFullText();
}
