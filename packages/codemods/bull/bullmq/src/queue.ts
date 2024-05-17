import type { ASTPath } from 'jscodeshift';
import { getBullImportDeclaration } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

export let replaceQueueOpts: ModifyFunction = (root, j) => {
	let bullImportDeclaration = getBullImportDeclaration(root, j);

	if (!bullImportDeclaration) {
		return;
	}

	let queueExpression = root.find(j.NewExpression, {
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
			let parentPath = id.parentPath as ASTPath;

			if (typeof parentPath.replace === 'function') {
				parentPath.replace(
					j.stringLiteral(
						'connection: { host: redis.host, port: redis.port }',
					),
				);
			}
		});
};
