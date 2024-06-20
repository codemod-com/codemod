/*! @license

ISC License

Copyright (c) 2023, Gonzalo D'Elia

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

/*
Changes to the original file: fixed ts errors
*/

import type {
	API,
	ASTPath,
	ArrowFunctionExpression,
	FileInfo,
	FunctionExpression,
	Identifier,
	JSCodeshift,
	ObjectPattern,
	TSIntersectionType,
	TSTypeAnnotation,
	TSTypeLiteral,
	TSTypeReference,
	VariableDeclarator,
} from 'jscodeshift';

export let parser = 'tsx';

let isIdentifier = (x: unknown): x is Identifier =>
	(x as Identifier).type === 'Identifier';
let isTsTypeReference = (x: unknown): x is TSTypeReference =>
	(x as TSTypeReference).type === 'TSTypeReference';
let isObjectPattern = (x: unknown): x is ObjectPattern =>
	(x as ObjectPattern).type === 'ObjectPattern';

let isArrowFunctionExpression = (x: unknown): x is ArrowFunctionExpression =>
	(x as ArrowFunctionExpression).type === 'ArrowFunctionExpression';
// Using a function that accepts a component definition

export default function transform(fileInfo: FileInfo, api: API) {
	let j = api.j;
	function addPropsTypeToComponentBody(n: ASTPath<VariableDeclarator>) {
		// extract the Prop's type text
		let reactFcOrSfcNode: any;
		if (isIdentifier(n.node.id)) {
			if (
				j.TSIntersectionType.check(
					n.node.id.typeAnnotation?.typeAnnotation,
				)
			) {
				reactFcOrSfcNode = n.node.id.typeAnnotation?.typeAnnotation
					?.types[0] as TSTypeReference;
			} else {
				reactFcOrSfcNode = n.node.id.typeAnnotation
					?.typeAnnotation as TSTypeReference;
			}
		}

		// shape of React.FC (no props)
		if (!reactFcOrSfcNode?.typeParameters) {
			return;
		}

		let outerNewTypeAnnotation = extractPropsDefinitionFromReactFC(
			j,
			reactFcOrSfcNode,
		);
		// build the new nodes
		let componentFunctionNode = (
			j.CallExpression.check(n.node.init)
				? n.node.init.arguments[0]
				: n.node.init
		) as ArrowFunctionExpression | FunctionExpression;

		let paramsLength = componentFunctionNode?.params?.length;
		// The remaining parameters except the first parameter
		let restParameters = [];
		if (!paramsLength) {
			// if no params, it could be that the component is not actually using props, so nothing to do here
			return;
		}

		restParameters = componentFunctionNode.params.slice(1, paramsLength);

		let firstParam = componentFunctionNode.params[0];

		let componentFunctionFirstParameter:
			| Identifier
			| ObjectPattern
			| undefined;
		// form of (props) =>
		if (isIdentifier(firstParam)) {
			componentFunctionFirstParameter = j.identifier.from({
				...firstParam,
				typeAnnotation: outerNewTypeAnnotation!,
			});
		}

		// form of ({ foo }) =>
		if (isObjectPattern(firstParam)) {
			let { properties, ...restParams } = firstParam;
			componentFunctionFirstParameter = j.objectPattern.from({
				...restParams,
				// remove locations because properties might have a spread like ({ id, ...rest }) => and it breaks otherwise
				properties: properties.map(({ loc, ...rest }) => {
					let key =
						rest.type.slice(0, 1).toLowerCase() +
						rest.type.slice(1);
					// This workaround is because the AST parsed has "RestElement, but codeshift (as well as the types) expects "RestProperty"
					// manually doing this works ok. restElement has the properties needed
					if (key === 'restElement') {
						let prop = rest as unknown;
						// @ts-expect-error props unknonw
						return j.restProperty.from({ argument: prop.argument });
					}
					return j[key].from({ ...rest });
				}),
				typeAnnotation: outerNewTypeAnnotation!,
			});
		}

		let newInit: ArrowFunctionExpression | FunctionExpression | undefined;
		if (isArrowFunctionExpression(componentFunctionNode)) {
			newInit = j.arrowFunctionExpression.from({
				...componentFunctionNode,
				params: [componentFunctionFirstParameter!, ...restParameters],
			});
		} else {
			newInit = j.functionExpression.from({
				...componentFunctionNode,
				params: [componentFunctionFirstParameter!, ...restParameters],
			});
		}
		let newVariableDeclarator: VariableDeclarator;
		if (j.CallExpression.check(n.node.init)) {
			newVariableDeclarator = j.variableDeclarator.from({
				...n.node,
				init: {
					...n.node.init,
					arguments: [newInit],
				},
			});
		} else {
			newVariableDeclarator = j.variableDeclarator.from({
				...n.node,
				init: newInit,
			});
		}

		n.replace(newVariableDeclarator);
		return;
	}

	function removeReactFCorSFCdeclaration(n: ASTPath<VariableDeclarator>) {
		let { id, ...restOfNode } = n.node;
		let { typeAnnotation, ...restOfId } = id as Identifier;
		let newId = j.identifier.from({ ...restOfId });
		let newVariableDeclarator = j.variableDeclarator.from({
			...restOfNode,
			id: newId,
		});
		n.replace(newVariableDeclarator);
	}

	try {
		let root = j(fileInfo.source);
		let hasModifications = false;
		let newSource = root
			.find(j.VariableDeclarator, (n: unknown) => {
				// @ts-expect-error n unknown
				let identifier = n?.id;
				let typeName: any;
				if (
					j.TSIntersectionType.check(
						identifier?.typeAnnotation?.typeAnnotation,
					)
				) {
					typeName =
						identifier.typeAnnotation.typeAnnotation.types[0]
							.typeName;
				} else {
					typeName =
						identifier?.typeAnnotation?.typeAnnotation?.typeName;
				}

				let genericParamsType =
					identifier?.typeAnnotation?.typeAnnotation?.typeParameters
						?.type;
				// verify it is the shape of React.FC<Props> React.SFC<Props>, React.FC<{ type: string }>, FC<Props>, SFC<Props>, and so on

				let isEqualFcOrFunctionComponent = (name: string) =>
					['FC', 'FunctionComponent'].includes(name);
				let isFC =
					(typeName?.left?.name === 'React' &&
						isEqualFcOrFunctionComponent(typeName?.right?.name)) ||
					isEqualFcOrFunctionComponent(typeName?.name);
				let isSFC =
					(typeName?.left?.name === 'React' &&
						typeName?.right?.name === 'SFC') ||
					typeName?.name === 'SFC';

				return (
					(isFC || isSFC) &&
					([
						'TSQualifiedName',
						'TSTypeParameterInstantiation',
					].includes(genericParamsType) ||
						!identifier?.typeAnnotation?.typeAnnotation
							?.typeParameters)
				);
			})
			.forEach((n) => {
				hasModifications = true;
				addPropsTypeToComponentBody(n);
				removeReactFCorSFCdeclaration(n);
			})
			.toSource();
		return hasModifications ? newSource : null;
	} catch (e) {
		console.log(e);
	}
}

function extractPropsDefinitionFromReactFC(
	j: JSCodeshift,
	reactFcOrSfcNode: TSTypeReference,
): TSTypeAnnotation {
	let typeParameterFirstParam = reactFcOrSfcNode.typeParameters?.params[0];
	let newInnerTypeAnnotation:
		| TSTypeReference
		| TSIntersectionType
		| TSTypeLiteral
		| undefined;

	// form of React.FC<Props> or React.SFC<Props>
	if (isTsTypeReference(typeParameterFirstParam)) {
		let { loc, ...rest } = typeParameterFirstParam;
		newInnerTypeAnnotation = j.tsTypeReference.from({ ...rest });
	} else if (j.TSIntersectionType.check(typeParameterFirstParam)) {
		// form of React.FC<Props & Props2>
		let { loc, ...rest } = typeParameterFirstParam;
		newInnerTypeAnnotation = j.tsIntersectionType.from({
			...rest,
			types: rest.types.map((t) => buildDynamicalNodeByType(j, t)),
		});
	} else {
		// form of React.FC<{ foo: number }> or React.SFC<{ foo: number }>
		let inlineTypeDeclaration = typeParameterFirstParam as TSTypeLiteral;
		// remove locations to avoid messing up with commans
		let newMembers = inlineTypeDeclaration.members.map((m) =>
			buildDynamicalNodeByType(j, m),
		);
		newInnerTypeAnnotation = j.tsTypeLiteral.from({ members: newMembers });
	}

	let outerNewTypeAnnotation = j.tsTypeAnnotation.from({
		typeAnnotation: newInnerTypeAnnotation,
	});
	return outerNewTypeAnnotation;
}

// dynamically call the api method to build the proper node. For example TSPropertySignature becomes tsPropertySignature
function buildDynamicalNodeByType(j: JSCodeshift, { loc, ...rest }: unknown) {
	let key = rest.type.slice(0, 2).toLowerCase() + rest.type.slice(2);
	return j[key].from({ ...rest });
}
