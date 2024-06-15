import type { API, FileInfo, JSCodeshift, Options } from 'jscodeshift';

let REACT_CLASS_COMPONENT_SUPERCLASS_NAMES = ['PureComponent', 'Component'];

let buildCallbackRef = (j: JSCodeshift, refName: string) =>
	j.jsxAttribute(
		j.jsxIdentifier('ref'),
		j.jsxExpressionContainer(
			j.arrowFunctionExpression(
				[j.jsxIdentifier('ref')],
				j.blockStatement([
					j.expressionStatement(
						j.assignmentExpression(
							'=',
							j.memberExpression(
								j.memberExpression(
									j.thisExpression(),
									j.identifier('refs'),
								),
								j.identifier(refName),
							),
							j.identifier('ref'),
						),
					),
				]),
			),
		),
	);

export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let isDirty = false;

	let reactComponentNamedImportLocalNamesSet = new Set();
	let reactDefaultImportName: string | null = null;

	root.find(j.ImportDeclaration, {
		source: { value: 'react' },
	}).forEach((path) => {
		path.value.specifiers?.forEach((specifier) => {
			// named import
			if (
				j.ImportSpecifier.check(specifier) &&
				REACT_CLASS_COMPONENT_SUPERCLASS_NAMES.includes(
					specifier.imported.name,
				)
			) {
				reactComponentNamedImportLocalNamesSet.add(
					specifier.local?.name,
				);
			}

			// default and wildcard import
			if (
				j.ImportDefaultSpecifier.check(specifier) ||
				j.ImportNamespaceSpecifier.check(specifier)
			) {
				reactDefaultImportName = specifier.local?.name ?? null;
			}
		});
	});

	let reactComponentNamedImportLocalNames = [
		...reactComponentNamedImportLocalNamesSet,
	];

	let classComponentCollection = root
		.find(j.ClassDeclaration)
		.filter((path) => {
			let superClass = path.value.superClass;

			if (j.Identifier.check(superClass)) {
				return [...reactComponentNamedImportLocalNames].includes(
					superClass.name,
				);
			}

			if (
				j.MemberExpression.check(superClass) &&
				j.Identifier.check(superClass.object) &&
				superClass.object.name === reactDefaultImportName &&
				j.Identifier.check(superClass.property)
			) {
				return REACT_CLASS_COMPONENT_SUPERCLASS_NAMES.includes(
					superClass.property.name,
				);
			}

			return false;
		});

	classComponentCollection
		.find(j.JSXAttribute, {
			name: {
				type: 'JSXIdentifier',
				name: 'ref',
			},
		})
		.forEach((path) => {
			let attributeValue = path.value.value;
			if (!j.StringLiteral.check(attributeValue)) {
				return;
			}

			isDirty = true;

			path.replace(buildCallbackRef(j, attributeValue.value));
		});

	return isDirty ? root.toSource() : undefined;
}
