import type core from 'jscodeshift';
import type { Collection } from 'jscodeshift';

export let getBullImportDeclaration = <T,>(
	root: Collection<T>,
	j: core.JSCodeshift,
) => {
	let bullImportDeclaration = root
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

export let getBullImportSpecifiers = <T,>(
	root: Collection<T>,
	j: core.JSCodeshift,
) => {
	let declaration = getBullImportDeclaration(root, j);

	if (!declaration) {
		return;
	}

	let { specifiers: bullImportSpecifiers } = declaration;

	return bullImportSpecifiers ?? null;
};
