import type { API, FileInfo } from 'jscodeshift';

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	// Find all CallExpressions
	root.find(j.CallExpression).forEach((path) => {
		// Ensure the callee is a MemberExpression
		if (path.node.callee.type === 'MemberExpression') {
			// Ensure the object is an Identifier named 'integration'
			if (path.node.callee.object.type === 'Identifier') {
				// Ensure the property is an Identifier named 'addBuildContext'
				if (
					path.node.callee.property.type === 'Identifier' &&
					path.node.callee.property.name === 'addBuildContext'
				) {
					// Replace 'addBuildContext' with 'addBuildEventContext'
					path.node.callee.property.name = 'addBuildEventContext';
				}
			}
		}
	});

	return root.toSource();
}
