import type core from 'jscodeshift';
import type { Collection } from 'jscodeshift';

export const getBullImportDeclaration = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
) => {
	const bullImportDeclaration = root
		.find(
			j.ImportDeclaration,
			(declaration) =>
				declaration.source.value === 'bull' ||
				declaration.source.value === 'bullmq',
		)
		.nodes()
		.at(0);

	return bullImportDeclaration ?? null;
};

export const getBullImportSpecifiers = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
) => {
	const declaration = getBullImportDeclaration(root, j);

	if (!declaration) {
		return;
	}

	const { specifiers: bullImportSpecifiers } = declaration;

	return bullImportSpecifiers ?? null;
};
