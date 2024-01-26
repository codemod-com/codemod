import { getBullImportSpecifiers } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

const typeMapper: Record<string, string> = {
	JobOptions: 'DefaultJobOptions',
};

// Any references on the right side of queue are meant to be replaced with equivalents
export const replaceTypeReferences: ModifyFunction = (root, j) => {
	const bullImportSpecifiers = getBullImportSpecifiers(root, j);

	if (!bullImportSpecifiers) {
		return;
	}

	root.find(j.TSQualifiedName).forEach((path) => {
		const { left, right } = path.value;

		if (
			!j.Identifier.check(left) ||
			!j.Identifier.check(right) ||
			left.name !== 'Queue'
		) {
			return;
		}

		const newTypeName = typeMapper[right.name];
		bullImportSpecifiers.push({
			type: 'ImportSpecifier',
			imported: {
				type: 'Identifier',
				name: newTypeName,
			},
		});

		const { parentPath } = path;
		if (j.TSTypeReference.check(parentPath.value)) {
			parentPath.value.typeName = {
				type: 'Identifier',
				name: newTypeName,
			};
		}
	});
};
