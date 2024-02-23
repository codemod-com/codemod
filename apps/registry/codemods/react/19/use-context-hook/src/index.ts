import type { API, FileInfo, Options } from "jscodeshift";
import { Identifier } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.Identifier, { name: "useContext" }).forEach((path) => {
		if (path.node.type === "Identifier") {
			const newIdentifier = j.identifier.from({ name: "use" });

			path.replace(newIdentifier);
		}
	});

	root.find(j.ImportSpecifier).forEach((path) => {
		if (path.node.type === "ImportSpecifier") {
			if ((path.node.imported as Identifier).name === "useContext") {
				const newImportSpecifier = j.importSpecifier.from({
					local: j.identifier("use"),
					imported: j.identifier("use"),
				});

				path.replace(newImportSpecifier);
			}
		}
	});

	return root.toSource();
}
