import type { ASTPath } from 'jscodeshift';
import { getBullImportDeclaration } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

export const replaceQueueOpts: ModifyFunction = (root, j) => {
	const bullImportDeclaration = getBullImportDeclaration(root, j);

	if (!bullImportDeclaration) {
		return;
	}

	const queueExpression = root.find(j.NewExpression, {
		callee: {
			type: 'Identifier',
			name: 'Queue',
		},
	});

	if (!queueExpression.length) {
		return;
	}

	queueExpression
		.find(j.Identifier, (id) => id.name === 'createClient')
		.forEach((id) => {
			// any path
			const parentPath = id.parentPath as ASTPath;

			if (typeof parentPath.replace === 'function') {
				parentPath.replace(
					j.stringLiteral(
						'connection: { host: redis.host, port: redis.port }',
					),
				);
			}
		});
};
