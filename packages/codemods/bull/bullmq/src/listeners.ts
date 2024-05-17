import { getBullImportSpecifiers } from './get-import-declaration.js';
import type { ModifyFunction } from './types.js';

export let replaceListeners: ModifyFunction = (root, j) => {
	let bullImportSpecifiers = getBullImportSpecifiers(root, j);

	if (!bullImportSpecifiers) {
		return;
	}

	// Replace listeners
	root.find(j.VariableDeclaration, (vd) => {
		let declarator = vd.declarations.at(0);

		if (!j.VariableDeclarator.check(declarator)) {
			return false;
		}

		let { init: initializer } = declarator;
		return (
			initializer?.type === 'NewExpression' &&
			initializer.callee.type === 'Identifier' &&
			initializer.callee.name === 'Queue'
		);
	}).forEach((declaration) => {
		let realDeclaration = declaration.value.declarations.at(0);
		if (!realDeclaration || realDeclaration.type !== 'VariableDeclarator') {
			return;
		}
		let declarationIdentifier =
			realDeclaration.id.type === 'Identifier'
				? realDeclaration.id.name
				: undefined;
		if (!declarationIdentifier) {
			return;
		}

		let eventListeners = root.find(
			j.MemberExpression,
			(me) =>
				me.object.type === 'Identifier' &&
				me.object.name === declarationIdentifier &&
				me.property.type === 'Identifier' &&
				me.property.name === 'on',
		);

		if (eventListeners.length) {
			bullImportSpecifiers.push({
				type: 'ImportSpecifier',
				imported: {
					type: 'Identifier',
					name: 'QueueEvents',
				},
			});

			let eventsDeclaration = j.variableDeclaration('const', [
				j.variableDeclarator(
					j.identifier('queueEvents'),
					j.newExpression(
						j.identifier('QueueEvents'),
						realDeclaration.init?.type === 'NewExpression'
							? realDeclaration.init.arguments.slice(0, 1)
							: [],
					),
				),
			]);

			eventListeners.forEach((eventListener) => {
				eventListener.value.object = j.identifier('queueEvents');
			});

			declaration.insertAfter(eventsDeclaration);
		}
	});
};
