import type { FileInfo, API, Options } from "jscodeshift";
import { Identifier, ImportSpecifier } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Helper function to preserve comments when replacing nodes
	function replaceWithComments(path, newNode) {
		// If the original node had comments, add them to the new node
		if (path.node.comments) {
			newNode.comments = path.node.comments;
		}

		// Replace the node
		j(path).replaceWith(newNode);
	}

	// Find all instances of 'useContext' and replace them with 'use'
	root.find(j.ImportSpecifier).forEach((path) => {
		// Ensure that the node is an ImportSpecifier before replacing
		if (path.node.type === "ImportSpecifier") {
			// Check if the imported name is 'useContext'
			if ((path.node.imported as Identifier).name === "useContext") {
				// Create a new ImportSpecifier node with the name 'use'
				const newImportSpecifier = j.importSpecifier.from({
					local: j.identifier("use"),
					imported: j.identifier("use"),
				});

				// Replace the old node with the new one, preserving comments
				replaceWithComments(path, newImportSpecifier);
			}
		}
	});

	return root.toSource();
}
