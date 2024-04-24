import type { API, FileInfo } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Find import declarations
	root.find(j.ImportDeclaration).forEach((path) => {
		// Ensure the import source is 'zod'
		if (path.node.source.value === "zod") {
			// Change the import source to '@netlify/sdk'
			path.node.source.value = "@netlify/sdk";
		}
	});

	return root.toSource();
}
