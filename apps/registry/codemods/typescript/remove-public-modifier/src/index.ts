import type { API, FileInfo } from 'jscodeshift';

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.ClassDeclaration).forEach((path) => {
		// Remove explicit 'public' modifiers from class members
		path.node.body.body.forEach((member) => {
			if (
				member.type === 'MethodDefinition' ||
				member.type === 'ClassProperty'
			) {
				// Remove modifiers
				member.accessibility = undefined;
				member.static = undefined;
				member.readonly = undefined;
			}
		});
	});

	return root.toSource();
}
