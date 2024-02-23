import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.findJSXElements().forEach((elementPath) => {
		const value = elementPath.value;
		const elements = [value.openingElement, value.closingElement];
		elements.forEach((element) => {
			if (
				element &&
				element.name.type === "JSXMemberExpression" &&
				element.name.object.type === "JSXIdentifier"
			) {
				const objectName = element.name.object.name;
				const propertyName = element.name.property.name;
				if (
					objectName.toLocaleLowerCase().includes("context") &&
					propertyName === "Provider"
				) {
					element.name = element.name.object;
				}
			}
			return null;
		});
	});

	return root.toSource();
}
