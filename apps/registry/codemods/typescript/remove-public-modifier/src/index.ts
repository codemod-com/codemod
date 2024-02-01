import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.ClassDeclaration).forEach((path) => {
		path.node.body.body.forEach((member) => {
			if (
				(member.type === 'ClassMethod' ||
					member.type === 'ClassProperty') &&
				'accessibility' in member
			) {
				member.accessibility = undefined;
			}
		});
	});

	return root.toSource();
}
