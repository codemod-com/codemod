import { getBullImportDeclaration } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

export let replaceOldQueueImport: ModifyFunction = (root, j) => {
	let declaration = getBullImportDeclaration(root, j);

	if (!declaration) {
		return;
	}

	let { source, specifiers: bullImportSpecifiers } = declaration;

	if (!bullImportSpecifiers) {
		return;
	}

	source.value = 'bullmq';

	let queueImportIndex = bullImportSpecifiers.findIndex(
		(sp) => sp.local?.name === 'Queue',
	);
	let jobOptionsImportIndex = bullImportSpecifiers.findIndex(
		(sp) => sp.local?.name === 'JobOptions',
	);

	if (queueImportIndex !== -1) {
		bullImportSpecifiers.splice(queueImportIndex, 1);
		bullImportSpecifiers.push({
			type: 'ImportSpecifier',
			imported: {
				type: 'Identifier',
				name: 'Queue',
			},
		});
	}

	if (jobOptionsImportIndex !== -1) {
		bullImportSpecifiers.splice(jobOptionsImportIndex, 1);
		bullImportSpecifiers.push({
			type: 'ImportSpecifier',
			imported: {
				type: 'Identifier',
				name: 'JobsOptions',
			},
		});

		root.find(j.Identifier).forEach((path) => {
			let { name } = path.value;
			if (name === 'JobOptions') {
				path.value.name = 'JobsOptions';
			}
		});
	}
};
