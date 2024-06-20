import type { ASTPath, CallExpression } from 'jscodeshift';
import { getBullImportSpecifiers } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

export let replaceProcessWithWorkers: ModifyFunction = (root, j) => {
	let bullImportSpecifiers = getBullImportSpecifiers(root, j);

	if (!bullImportSpecifiers) {
		return;
	}

	let shouldApplyWorkerChanges = root.find(
		j.ImportDeclaration,
		(declaration) => {
			let declarationSource =
				declaration.source.value?.toString() ?? null;

			let { specifiers: imported } = declaration;
			if (!declarationSource || !imported) {
				return false;
			}

			// Dumb way to identify proper files to make changes for worker, but at least that makes the circle smaller.
			return (
				declarationSource.includes('bull') ||
				declarationSource.includes('queue') ||
				imported.some((i) =>
					i.local?.name.toLowerCase().includes('queue'),
				)
			);
		},
	);

	if (shouldApplyWorkerChanges) {
		root.find(
			j.MemberExpression,
			(me) =>
				me.property.type === 'Identifier' &&
				me.property.name === 'process',
		).forEach((me) => {
			let path = me.parentPath as ASTPath<CallExpression>;
			if (!j.CallExpression.check(path.value)) {
				return;
			}

			let callBody = path.value.arguments.at(0) ?? null;
			if (!callBody) {
				return;
			}

			bullImportSpecifiers.push({
				type: 'ImportSpecifier',
				imported: {
					type: 'Identifier',
					name: 'Worker',
				},
			});

			let workerDeclaration = j.variableDeclaration('const', [
				j.variableDeclarator(
					j.identifier('worker'),
					j.newExpression(j.identifier('Worker'), [
						j.stringLiteral('unknown-name'),
						callBody,
						j.stringLiteral(
							'{ connection: { host: redis.host, port: redis.port } }',
						),
					]),
				),
			]);

			path.replace(workerDeclaration);
		});
	}
};
