import type { API, FileInfo } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	const hooksToRemove = ["useMemo", "useCallback", "memo"];

	root.find(j.ImportDeclaration).forEach((path) => {
		const specifiers =
			path.node.specifiers?.filter((specifier) => {
				if (specifier.type === "ImportSpecifier") {
					return !hooksToRemove.includes(specifier.imported.name);
				}
				return specifier;
			}) ?? [];

		if (specifiers.length === 0) {
			j(path).remove();
		} else {
			path.node.specifiers = specifiers;
		}
	});

	hooksToRemove.forEach((hook) => {
		root
			.find(j.MemberExpression, {
				object: { name: "React" },
				property: { name: hook },
			})
			.forEach((path) => {
				j(path).remove();
			});
	});

	hooksToRemove.forEach((hook) => {
		root.find(j.Identifier, { name: hook }).forEach((path) => {
			j(path).remove();
		});
	});

	return root.toSource();
}
