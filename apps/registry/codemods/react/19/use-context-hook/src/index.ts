import type { API, FileInfo, Options } from "jscodeshift";

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

	return root.toSource();
}
