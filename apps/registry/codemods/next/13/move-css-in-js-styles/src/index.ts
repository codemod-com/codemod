import { join, parse } from 'node:path';
import type { API, FileInfo, Options, Transform } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options) {
	const j = api.jscodeshift;

	const root = j(file.source);

	let dirtyFlag = false;

	const newCssFileNames: string[] = [];

	root.find(j.JSXElement, {
		type: 'JSXElement',
		openingElement: {
			type: 'JSXOpeningElement',
			name: { type: 'JSXIdentifier', name: 'style' },
		},
	}).forEach((jsxElementPath) => {
		const parentPath: typeof jsxElementPath = jsxElementPath.parentPath; // todo how to ensure the correct types?

		if (parentPath?.node?.type !== 'JSXElement') {
			return;
		}

		let cssSource: string = '';

		j(jsxElementPath)
			.find(j.TemplateElement)
			.forEach((templateElementPath) => {
				cssSource += templateElementPath.value.value.raw;
			});

		j(jsxElementPath)
			.find(j.StringLiteral)
			.forEach((literalPath) => {
				cssSource += literalPath.value.value;
			});

		if (cssSource === '') {
			return;
		}

		parentPath.node.openingElement.attributes =
			parentPath.node.openingElement.attributes ?? [];

		parentPath.node.openingElement.attributes.push(
			j.jsxAttribute(
				j.jsxIdentifier('className'),
				j.jsxExpressionContainer(
					j.memberExpression(
						j.identifier('styles'),
						j.literal('wrapper'),
					),
				),
			),
		);

		jsxElementPath.replace();

		if ('createFile' in options) {
			const { root, dir, base, ext } = parse(file.path);

			const name = `${base.slice(
				0,
				base.length - ext.length,
			)}.module.css`;

			const newPath = join(root, dir, name);

			options.createFile(newPath, cssSource);

			newCssFileNames.push(name);
		}

		dirtyFlag = true;
	});

	if (!dirtyFlag) {
		return undefined;
	}

	const importDeclarations = newCssFileNames.map((name) =>
		j.importDeclaration(
			[j.importDefaultSpecifier(j.identifier('styles'))],
			j.stringLiteral(name),
		),
	);

	root.find(j.Program).forEach((program) => {
		for (const importDeclaration of importDeclarations) {
			program.value.body.unshift(importDeclaration);
		}
	});

	return root.toSource();
}

transform satisfies Transform;
