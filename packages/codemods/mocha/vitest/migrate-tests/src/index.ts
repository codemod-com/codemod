import type { API, FileInfo, ImportDeclaration } from 'jscodeshift';

let mochaGlobalApis = [
	'afterAll',
	'afterEach',
	'beforeAll',
	'beforeEach',
	'describe',
	'test',
	'it',
];

let mochaApiProps = ['only', 'skip'];
let mochaGlobalApiProps = {
	describe: mochaApiProps,
	it: mochaApiProps,
	test: mochaApiProps,
};
let mochaGlobalApiKeys = Object.keys(mochaGlobalApiProps);

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	let vitestImportDeclarations = root.find(j.ImportDeclaration, {
		source: {
			type: 'StringLiteral',
			value: 'vitest',
		},
	});

	if (vitestImportDeclarations.length > 0) {
		return undefined;
	}

	let describeIdentifiers = root.find(j.Identifier, {
		name: 'describe',
	});

	if (describeIdentifiers.length === 0) {
		return undefined;
	}

	// Find the import declaration for 'chai'
	let chaiImportDeclarations = root.find(j.ImportDeclaration, {
		source: {
			type: 'StringLiteral',
			value: 'chai',
		},
	});

	root.find(j.ImportDeclaration).forEach((importDeclaration) => {
		importDeclaration.node.specifiers?.forEach((specifier) => {
			if (specifier.type !== 'ImportSpecifier') {
				return;
			}
			let importName = specifier.imported.name;

			if (!mochaGlobalApiKeys.includes(importName)) {
				return;
			}
			let castedImportName =
				importName as keyof typeof mochaGlobalApiProps;
			if (!mochaGlobalApiProps[castedImportName]) {
				return;
			}
			delete mochaGlobalApiProps[castedImportName];
		});
	});

	let comments: NonNullable<ImportDeclaration['comments']> = [];

	let namesToImport = new Set<string>();

	chaiImportDeclarations.forEach((path) => {
		path.node.comments?.forEach((commentKind) => {
			comments.push(commentKind);
		});

		path.node.specifiers?.forEach((specifier) => {
			if (j.ImportSpecifier.check(specifier) && specifier.local?.name) {
				namesToImport.add(specifier.local.name);
			}
		});
	});

	chaiImportDeclarations.remove();

	// Remove mocha imports and references
	let toRemove: string[] = [];
	let mochaImport = root.find(j.ImportDeclaration, {
		source: { type: 'StringLiteral', value: 'mocha' },
	});

	mochaImport.forEach((declaration) => {
		declaration.node.specifiers?.forEach((specifier) => {
			if (j.ImportSpecifier.check(specifier) && specifier.local?.name) {
				toRemove.push(specifier.local.name);
			}
		});
		j(declaration).remove();
	});

	toRemove.forEach((spec) => {
		root.find(j.TSTypeAnnotation, {
			typeAnnotation: {
				typeName: { type: 'Identifier', name: spec },
			},
		}).forEach((annotation) => {
			let { value: typedIdentifier } = annotation.parent;
			if (j.Identifier.check(typedIdentifier)) {
				if (typedIdentifier.name !== 'this') {
					return j(annotation.parentPath).replaceWith(
						typedIdentifier.name,
					);
				}

				j(annotation.parentPath).remove();
			}
		});

		root.find(j.Identifier, { name: spec }).forEach((identifier) => {
			j(identifier).remove();
		});
	});

	Object.entries(mochaGlobalApiProps).forEach(([api, props]) => {
		let propNamesList = root
			.find(j.MemberExpression, {
				object: { name: api },
				property: { type: 'Identifier' },
			})
			.nodes()
			.map(
				(node) =>
					j.Identifier.check(node.property) && node.property.name,
			)
			.filter(Boolean) as string[];

		let propNames = [...new Set(propNamesList)];
		for (let propName of propNames) {
			if (props.includes(propName)) {
				namesToImport.add(api);
				break;
			}
		}
	});

	for (let globalApi of mochaGlobalApis) {
		let calls = root.find(j.CallExpression, {
			callee: { name: globalApi },
		});

		if (calls.length > 0) {
			namesToImport.add(globalApi);
		}
	}

	let testCalls = root
		.find(j.CallExpression)
		.filter(
			(path) =>
				j.Identifier.check(path.node.callee) &&
				mochaGlobalApis.includes(path.node.callee.name),
		);

	if (testCalls.length > 0) {
		testCalls
			.forEach(
				(tc) =>
					j.Identifier.check(tc.node.callee) &&
					namesToImport.add(tc.node.callee.name),
			)
			.filter(Boolean);
	}

	let program = root.find(j.Program).nodes()[0];

	if (!program) {
		return undefined;
	}

	let index = program.body.findIndex((value) =>
		j.ImportDeclaration.check(value),
	);

	if (namesToImport.size > 0) {
		program.body.splice(
			index + 1,
			0,
			j.importDeclaration.from({
				comments,
				source: j.literal('vitest'),
				specifiers: Array.from(namesToImport).map((name) =>
					j.importSpecifier(j.identifier(name)),
				),
			}),
		);
	}

	return root.toSource();
}
