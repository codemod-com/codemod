import type { API, FileInfo } from 'jscodeshift';

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let isDirty = false;

	root.findJSXElements().forEach((elementPath) => {
		let { value } = elementPath;
		let elements = [value.openingElement, value.closingElement];
		elements.forEach((element) => {
			if (!element) {
				return;
			}
			if (
				!j.JSXMemberExpression.check(element.name) ||
				!j.JSXIdentifier.check(element.name.object)
			) {
				return;
			}

			let objectName = element.name.object.name;
			let propertyName = element.name.property.name;

			if (
				objectName.toLocaleLowerCase().includes('context') &&
				propertyName === 'Provider'
			) {
				element.name = element.name.object;
				isDirty = true;
			}
		});
	});

	return isDirty ? root.toSource() : undefined;
}
