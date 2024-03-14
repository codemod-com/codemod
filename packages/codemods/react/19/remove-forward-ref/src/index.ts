import type {
	API,
	BlockStatement,
	FileInfo,
	Identifier,
	JSCodeshift,
	TSTypeReference,
	Transform,
} from "jscodeshift";

// Props & { ref: React.RefObject<Ref>}
const buildPropsAndRefIntersectionTypeAnnotation = (
	j: JSCodeshift,
	propType: TSTypeReference,
	refType: TSTypeReference,
) =>
	j.tsTypeAnnotation(
		j.tsIntersectionType([
			propType,
			j.tsTypeLiteral([
				j.tsPropertySignature.from({
					key: j.identifier("ref"),
					typeAnnotation: j.tsTypeAnnotation(
						j.tsTypeReference.from({
							typeName: j.tsQualifiedName(
								j.identifier("React"),
								j.identifier("RefObject"),
							),
							typeParameters: j.tsTypeParameterInstantiation([refType]),
						}),
					),
				}),
			]),
		]),
	);

// const { ref } = props;
const buildRefArgVariableDeclaration = (
	j: JSCodeshift,
	refArgName: string,
	propArgName: string,
) =>
	j.variableDeclaration("const", [
		j.variableDeclarator(
			j.objectPattern([
				j.objectProperty.from({
					shorthand: true,
					key: j.identifier("ref"),
					value: j.identifier(refArgName),
				}),
			]),
			j.identifier(propArgName),
		),
	]);

// React.ForwardedRef<HTMLButtonElement> => HTMLButtonElement
const getRefTypeFromRefArg = (j: JSCodeshift, refArg: Identifier) => {
	const typeReference = refArg.typeAnnotation?.typeAnnotation;

	if (
		!j.TSTypeReference.check(typeReference) ||
		!j.TSQualifiedName.check(typeReference.typeName)
	) {
		return null;
	}

	const { right } = typeReference.typeName;

	if (!j.Identifier.check(right) || right.name === "forwardedRef") {
		return null;
	}

	const [firstTypeParameter] = typeReference.typeParameters?.params ?? [];

	if (!j.TSTypeReference.check(firstTypeParameter)) {
		return null;
	}

	return firstTypeParameter;
};

export default function transform(file: FileInfo, api: API) {
	const { j } = api;

	const root = j(file.source);

	let dirtyFlag = false;

	root
		.find(j.CallExpression, {
			callee: {
				type: "Identifier",
				name: "forwardRef",
			},
		})
		.replaceWith((callExpressionPath) => {
			const [renderFunctionArg] = callExpressionPath.node.arguments;

			if (
				!j.FunctionExpression.check(renderFunctionArg) &&
				!j.ArrowFunctionExpression.check(renderFunctionArg)
			) {
				return null;
			}

			const [propsArg, refArg] = renderFunctionArg.params;

			if (!j.Identifier.check(refArg) || propsArg === undefined) {
				return null;
			}

			const refArgTypeReference = getRefTypeFromRefArg(j, refArg);

			// remove refArg
			renderFunctionArg.params.splice(1, 1);

			const refArgName = refArg.name;

			// if props are ObjectPattern, push ref as ObjectProperty
			if (j.ObjectPattern.check(propsArg)) {
				propsArg.properties.unshift(
					j.objectProperty.from({
						shorthand: true,
						key: j.identifier(refArgName),
						value: j.identifier(refArgName),
					}),
				);

				// update prop arg type
				const propsArgTypeReference = propsArg.typeAnnotation?.typeAnnotation;

				if (
					j.TSTypeReference.check(propsArgTypeReference) &&
					j.TSTypeReference.check(refArgTypeReference)
				) {
					propsArg.typeAnnotation = buildPropsAndRefIntersectionTypeAnnotation(
						j,
						propsArgTypeReference,
						refArgTypeReference,
					);
				}
			}

			// if props arg is Identifier, push ref variable declaration to the function body
			if (j.Identifier.check(propsArg)) {
				// if we have arrow function with implicit return, we want to wrap it with BlockStatement
				if (
					j.ArrowFunctionExpression.check(renderFunctionArg) &&
					!j.BlockStatement.check(renderFunctionArg.body)
				) {
					renderFunctionArg.body = j.blockStatement.from({
						body: [j.returnStatement(renderFunctionArg.body)],
					});
				}

				const newDeclaration = buildRefArgVariableDeclaration(
					j,
					refArg.name,
					propsArg.name,
				);

				(renderFunctionArg.body as BlockStatement).body.unshift(newDeclaration);

				const propsArgTypeReference = propsArg.typeAnnotation?.typeAnnotation;

				if (
					j.TSTypeReference.check(propsArgTypeReference) &&
					j.TSTypeReference.check(refArgTypeReference)
				) {
					propsArg.typeAnnotation = buildPropsAndRefIntersectionTypeAnnotation(
						j,
						propsArgTypeReference,
						refArgTypeReference,
					);
				}
			}

			/**
			 * Transform ts types: forwardRef type arguments are used
			 */

			// @ts-expect-error Property 'typeParameters' does not exist on type 'CallExpression'.
			const typeParameters = callExpressionPath.node.typeParameters;

			// if typeParameters are used in forwardRef generic, reuse them to annotate props type
			// forwardRef<Ref, Props>((props) => { ... }) ====> (props: Props & { ref: React.RefObject<Ref> }) => { ... }
			if (
				j.TSTypeParameterInstantiation.check(typeParameters) &&
				propsArg !== undefined &&
				"typeAnnotation" in propsArg
			) {
				const [refType, propType] = typeParameters.params;

				if (
					j.TSTypeReference.check(refType) &&
					j.TSTypeReference.check(propType)
				) {
					propsArg.typeAnnotation = buildPropsAndRefIntersectionTypeAnnotation(
						j,
						propType,
						refType,
					);
				}
			}

			dirtyFlag = true;
			return renderFunctionArg;
		});

	/**
	 * handle import
	 */
	if (dirtyFlag) {
		root
			.find(j.ImportDeclaration, {
				source: {
					value: "react",
				},
			})
			.forEach((importDeclarationPath) => {
				const { specifiers, importKind } = importDeclarationPath.node;

				if (importKind !== "value") {
					return;
				}

				if (specifiers === undefined) {
					return;
				}

				const forwardRefImportSpecifierIndex = specifiers.findIndex(
					(s) => j.ImportSpecifier.check(s) && s.imported.name === "forwardRef",
				);

				specifiers.splice(forwardRefImportSpecifierIndex, 1);
			})
			.filter((importDeclarationPath) => {
				const { specifiers } = importDeclarationPath.node;
				// remove the import if there are no more specifiers left after removing forwardRef
				return specifiers === undefined || specifiers.length === 0;
			})
			.remove();
	}

	return root.toSource();
}

transform satisfies Transform;
