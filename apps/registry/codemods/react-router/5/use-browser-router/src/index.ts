import type { API, FileInfo, Transform } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
	const j = api.jscodeshift;
	return j(file.source)
		.find(j.ImportDeclaration, {
			source: {
				value: "react-router",
			},
		})
		.forEach((path) => {
			if (!path.value.specifiers) {
				return;
			}
			path.value.specifiers.forEach((specifier) => {
				if (!j.ImportSpecifier.check(specifier)) {
					return;
				}
				if (specifier.imported.name !== "Router") {
					return;
				}

				// replace import source to "react-router-dom"
				path.value.source.value = "react-router-dom";

				// e.g., import { BrowserRouter as Router }
				specifier.imported.name = "BrowserRouter";
				specifier.local = j.identifier("Router");
			});
		})
		.toSource();
}

transform satisfies Transform;

export default transform;
