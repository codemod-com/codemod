import type {
	API,
	ArrowFunctionExpression,
	Collection,
	File,
	FileInfo,
	FunctionDeclaration,
	JSCodeshift,
	Options,
	Transform,
} from 'jscodeshift';

type AtomicMod<T, D extends 'read' | 'write'> = (
	j: JSCodeshift,
	root: Collection<T>,
	settings: Partial<Record<string, string>>,
) => [D extends 'write' ? boolean : false, ReadonlyArray<LazyAtomicMod>];

type LazyAtomicMod = [
	AtomicMod<any, 'read' | 'write'>,
	Collection<any>,
	Partial<Record<string, string>>,
];

export let upsertTypeAnnotationOnStateIdentifier: AtomicMod<
	ArrowFunctionExpression | FunctionDeclaration,
	'write'
> = (j, root, settings) => {
	let dirtyFlag = false;

	if (
		!root.isOfType(j.ArrowFunctionExpression) &&
		!root.isOfType(j.FunctionDeclaration)
	) {
		return [dirtyFlag, []];
	}

	root.forEach((astPath) => {
		let patternKind = astPath.value.params[0];

		if (patternKind?.type !== 'Identifier') {
			return;
		}

		let identifierPathCollection = j(astPath).find(j.Identifier, {
			name: patternKind.name,
		});

		let typeAnnotation = j.typeAnnotation(
			j.genericTypeAnnotation(
				j.identifier(settings.stateTypeIdentifierName ?? 'State'),
				null,
			),
		);

		dirtyFlag = true;

		// this uses the fact that the state parameter must be the first
		// found identifier under the arrow-function-expression
		identifierPathCollection.paths()[0]?.replace(
			j.identifier.from({
				comments: patternKind.comments ?? null,
				name: patternKind.name,
				optional: patternKind.optional,
				typeAnnotation,
			}),
		);
	});

	let filePath = root.closest(j.File);

	let lazyAtomicMods: LazyAtomicMod[] = [];

	if (dirtyFlag) {
		lazyAtomicMods.push([findStateImportDeclarations, filePath, settings]);
	}

	return [dirtyFlag, lazyAtomicMods];
};

export let upsertTypeAnnotationOnDispatchIdentifier: AtomicMod<
	ArrowFunctionExpression | FunctionDeclaration,
	'write'
> = (j, root, settings) => {
	let dirtyFlag = false;

	if (
		!root.isOfType(j.ArrowFunctionExpression) &&
		!root.isOfType(j.FunctionDeclaration)
	) {
		return [dirtyFlag, []];
	}

	root.forEach((astPath) => {
		let patternKind = astPath.value.params[0];

		if (patternKind?.type !== 'Identifier') {
			return;
		}

		let identifierPathCollection = j(astPath).find(j.Identifier, {
			name: patternKind.name,
		});

		let typeAnnotation = j.typeAnnotation(
			j.genericTypeAnnotation(
				j.identifier('ThunkDispatch'),
				j.typeParameterInstantiation([
					j.genericTypeAnnotation(
						j.identifier(
							settings.stateTypeIdentifierName ?? 'State',
						),
						null,
					),
					j.anyTypeAnnotation(),
					j.anyTypeAnnotation(),
				]),
			),
		);

		dirtyFlag = true;

		// this uses the fact that the state parameter must be the first
		// found identifier under the arrow-function-expression
		identifierPathCollection.paths()[0]?.replace(
			j.identifier.from({
				comments: patternKind.comments ?? null,
				name: patternKind.name,
				optional: patternKind.optional,
				typeAnnotation,
			}),
		);
	});

	let filePath = root.closest(j.File);

	let lazyAtomicMods: LazyAtomicMod[] = [];

	if (dirtyFlag) {
		lazyAtomicMods.push(
			[findStateImportDeclarations, filePath, settings],
			[findThunkDispatchImportDeclarations, filePath, settings],
		);
	}

	return [dirtyFlag, lazyAtomicMods];
};

export let upsertTypeAnnotationOnStateObjectPattern: AtomicMod<
	ArrowFunctionExpression | FunctionDeclaration,
	'write'
> = (j, root, settings) => {
	let dirtyFlag = false;

	if (
		!root.isOfType(j.ArrowFunctionExpression) &&
		!root.isOfType(j.FunctionDeclaration)
	) {
		return [dirtyFlag, []];
	}

	root.forEach((astPath) => {
		let patternKind = astPath.value.params[0];

		if (patternKind?.type !== 'ObjectPattern') {
			return;
		}

		let objectPatternPathCollection = j(astPath).find(j.ObjectPattern);

		let typeAnnotation = j.typeAnnotation(
			j.genericTypeAnnotation(
				j.identifier(settings.stateTypeIdentifierName ?? 'State'),
				null,
			),
		);
		dirtyFlag = true;

		// this uses the fact that the state parameter must be the first
		// found object pattern under the arrow-function-expression
		objectPatternPathCollection.paths()[0]?.replace(
			j.objectPattern.from({
				comments: patternKind.comments ?? null,
				decorators: patternKind.decorators,
				properties: patternKind.properties,
				typeAnnotation,
			}),
		);
	});

	let filePath = root.closest(j.File);

	if (!dirtyFlag) {
		return [dirtyFlag, []];
	}

	return [dirtyFlag, [[findStateImportDeclarations, filePath, settings]]];
};

export let findMapStateToPropsArrowFunctions: AtomicMod<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.VariableDeclarator, {
		id: {
			type: 'Identifier',
			name: 'mapStateToProps',
		},
		init: {
			type: 'ArrowFunctionExpression',
		},
	}).forEach((variableDeclaratorPath) => {
		let collection = j(variableDeclaratorPath)
			.find(j.ArrowFunctionExpression)
			.filter((arrowFunctionExpressionPath, i) => {
				return (
					i === 0 &&
					arrowFunctionExpressionPath.value.params.length !== 0
				);
			});

		lazyAtomicMods.push(
			[upsertTypeAnnotationOnStateIdentifier, collection, settings],
			[upsertTypeAnnotationOnStateObjectPattern, collection, settings],
		);
	});

	return [false, lazyAtomicMods];
};

export let findMapStateToPropsFunctions: AtomicMod<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.FunctionDeclaration, {
		id: {
			type: 'Identifier',
			name: 'mapStateToProps',
		},
	}).forEach((functionDeclarationPath) => {
		if (functionDeclarationPath.value.params.length === 0) {
			return;
		}

		let collection = j(functionDeclarationPath);

		lazyAtomicMods.push(
			[upsertTypeAnnotationOnStateIdentifier, collection, settings],
			[upsertTypeAnnotationOnStateObjectPattern, collection, settings],
		);
	});

	return [false, lazyAtomicMods];
};

export let findSelectFunctions: AtomicMod<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.FunctionDeclaration, {
		id: {
			type: 'Identifier',
		},
	}).forEach((functionDeclarationPath) => {
		let functionDeclaration = functionDeclarationPath.value;

		let identifierKind = functionDeclaration.id;

		if (
			identifierKind?.type !== 'Identifier' ||
			!identifierKind.name.startsWith('select') ||
			identifierKind.name.length === 6
		) {
			return;
		}

		if (functionDeclarationPath.value.params.length === 0) {
			return;
		}

		let collection = j(functionDeclarationPath);

		lazyAtomicMods.push(
			[upsertTypeAnnotationOnStateIdentifier, collection, settings],
			[upsertTypeAnnotationOnStateObjectPattern, collection, settings],
		);
	});

	return [false, lazyAtomicMods];
};

export let findSelectArrowFunctions: AtomicMod<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.VariableDeclarator, {
		id: {
			type: 'Identifier',
		},
		init: {
			type: 'ArrowFunctionExpression',
		},
	}).forEach((variableDeclaratorPath) => {
		let variableDeclarator = variableDeclaratorPath.value;

		let identifierKind = variableDeclarator.id;

		if (
			identifierKind?.type !== 'Identifier' ||
			!identifierKind.name.startsWith('select') ||
			identifierKind.name.length === 6
		) {
			return;
		}

		let collection = j(variableDeclaratorPath)
			.find(j.ArrowFunctionExpression)
			.filter((arrowFunctionExpressionPath, i) => {
				return (
					i === 0 &&
					arrowFunctionExpressionPath.value.params.length !== 0
				);
			});

		lazyAtomicMods.push(
			[upsertTypeAnnotationOnStateIdentifier, collection, settings],
			[upsertTypeAnnotationOnStateObjectPattern, collection, settings],
		);
	});

	return [false, lazyAtomicMods];
};

export let findMapDispatchToPropsArrowFunctions: AtomicMod<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.VariableDeclarator, {
		id: {
			type: 'Identifier',
			name: 'mapDispatchToProps',
		},
		init: {
			type: 'ArrowFunctionExpression',
		},
	}).forEach((variableDeclaratorPath) => {
		let collection = j(variableDeclaratorPath)
			.find(j.ArrowFunctionExpression)
			.filter((arrowFunctionExpressionPath, i) => {
				return (
					i === 0 &&
					arrowFunctionExpressionPath.value.params.length !== 0
				);
			});

		lazyAtomicMods.push([
			upsertTypeAnnotationOnDispatchIdentifier,
			collection,
			settings,
		]);
	});

	return [false, lazyAtomicMods];
};

export let findMapDispatchToPropsFunctions: AtomicMod<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let lazyAtomicMods: LazyAtomicMod[] = [];

	root.find(j.FunctionDeclaration, {
		id: {
			type: 'Identifier',
			name: 'mapDispatchToProps',
		},
	}).forEach((functionDeclarationPath) => {
		if (functionDeclarationPath.value.params.length === 0) {
			return;
		}

		let collection = j(functionDeclarationPath);

		lazyAtomicMods.push([
			upsertTypeAnnotationOnDispatchIdentifier,
			collection,
			settings,
		]);
	});

	return [false, lazyAtomicMods];
};

export let findStateImportDeclarations: AtomicMod<File, 'read'> = (
	j,
	root,
	settings,
) => {
	let name = settings.stateTypeIdentifierName ?? 'State';
	let value = settings.stateSourceLiteralValue ?? 'state';

	let existingDeclarations = root.find(j.ImportDeclaration, {
		specifiers: [
			{
				imported: {
					type: 'Identifier',
					name,
				},
			},
		],
		source: {
			value,
		},
	});

	if (existingDeclarations.size() !== 0) {
		return [false, []];
	}

	return [false, [[addImportDeclaration, root, { name, value }]]];
};

export let findThunkDispatchImportDeclarations: AtomicMod<File, 'write'> = (
	j,
	root,
) => {
	let name = 'ThunkDispatch';
	let value = 'redux-thunk';

	let existingDeclarations = root.find(j.ImportDeclaration, {
		specifiers: [
			{
				imported: {
					type: 'Identifier',
					name: 'ThunkDispatch',
				},
			},
		],
		source: {
			value: 'redux-thunk',
		},
	});

	if (existingDeclarations.size() !== 0) {
		return [false, []];
	}

	return [false, [[addImportDeclaration, root, { name, value }]]];
};

export let addImportDeclaration: AtomicMod<File, 'write'> = (
	j,
	root,
	settings,
) => {
	let name = settings.name;
	let value = settings.value;

	if (!name || !value) {
		throw new Error(
			'addStateImportDeclaration requires a name and a value in settings',
		);
	}

	let importDeclaration = j.importDeclaration(
		[j.importSpecifier(j.identifier(name), j.identifier(name))],
		j.stringLiteral(value),
	);

	root.find(j.Program).forEach((programPath) => {
		programPath.value.body.unshift(importDeclaration);
	});

	return [true, []];
};

export default function transform(file: FileInfo, api: API, jOptions: Options) {
	let j = api.jscodeshift;

	let dirtyFlag = false;

	let root = j(file.source);

	let settings = {
		stateTypeIdentifierName:
			'stateTypeIdentifierName' in jOptions
				? String(jOptions.stateTypeIdentifierName)
				: 'State',
		stateSourceLiteralValue:
			'stateSourceLiteralValue' in jOptions
				? String(jOptions.stateSourceLiteralValue)
				: 'state',
	};

	let lazyAtomicMods: LazyAtomicMod[] = [
		[findMapStateToPropsArrowFunctions, root, settings],
		[findMapStateToPropsFunctions, root, settings],
		[findMapDispatchToPropsArrowFunctions, root, settings],
		[findMapDispatchToPropsFunctions, root, settings],
		[findSelectArrowFunctions, root, settings],
		[findSelectFunctions, root, settings],
	];

	let handleLazyAtomicMod = (lazyAtomicMod: LazyAtomicMod) => {
		let [newDirtyFlag, newMods] = lazyAtomicMod[0](
			j,
			lazyAtomicMod[1],
			lazyAtomicMod[2],
		);

		dirtyFlag ||= newDirtyFlag;

		for (let newMod of newMods) {
			handleLazyAtomicMod(newMod);
		}
	};

	for (let lazyAtomicMod of lazyAtomicMods) {
		handleLazyAtomicMod(lazyAtomicMod);
	}

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource();
}

transform satisfies Transform;
