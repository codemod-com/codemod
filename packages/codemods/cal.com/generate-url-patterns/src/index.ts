import { parse, sep } from 'node:path';
import type {
	Filemod,
	HandleData,
	HandleFile,
	HandleFinish,
	InitializeState,
} from '@codemod-com/filemod';
import type { TSAsExpressionKind } from 'ast-types/gen/kinds.js';
import type { JSCodeshift } from 'jscodeshift';

type Dependencies = { jscodeshift: JSCodeshift };

type State = {
	step: 'READING' | 'UPSERTING';
	turboPath: string;
	abTestMiddlewarePath: string;
	middlewarePath: string;
	urlPatternEnvVarMap: Map<string, string>;
	generateAsPageGroup: boolean;
};

let initializeState: InitializeState<State> = async (
	options,
	previousState,
) => {
	if (previousState !== null) {
		return {
			...previousState,
			step: 'UPSERTING',
		};
	}

	let {
		turboPath,
		abTestMiddlewarePath,
		middlewarePath,
		generateAsPageGroup,
	} = options;

	if (typeof turboPath !== 'string') {
		throw new Error('The turbo.json absolute path has not been defined');
	}

	if (typeof abTestMiddlewarePath !== 'string') {
		throw new Error(
			'The abTestMiddleware absolute path has not been defined',
		);
	}

	if (typeof middlewarePath !== 'string') {
		throw new Error('The middleware.ts absolute path has not been defined');
	}

	return {
		step: 'READING',
		turboPath,
		abTestMiddlewarePath,
		middlewarePath,
		urlPatternEnvVarMap: new Map(),
		generateAsPageGroup: Boolean(generateAsPageGroup),
	};
};

let COMMON_PART_REGEX = /^(?<cpart>[a-zA-Z0-9-_]+)$/;
let DYNAMIC_SEGMENT_PART_REGEX = /^\[(?<dspart>[a-zA-Z0-9-_]+)\]$/;
let CATCH_ALL_DYNAMIC_SEGMENT_PART_REGEX =
	/^\[\.{3}(?<cadspart>[a-zA-Z0-9-_]+)\]$/;
let OPTIONAL_CATCH_ALL_DYNAMIC_SEGMENT_PART_REGEX =
	/^\[{2}\.{3}(?<ocadspart>[a-zA-Z0-9-_]+)\]{2}$/;

let isNeitherNullNorUndefined = <T,>(
	t: NonNullable<T> | null | undefined,
): t is NonNullable<T> => t !== null && t !== undefined;

let getRegexGroups = (part: string) => {
	let regExpExecArray =
		COMMON_PART_REGEX.exec(part) ??
		DYNAMIC_SEGMENT_PART_REGEX.exec(part) ??
		CATCH_ALL_DYNAMIC_SEGMENT_PART_REGEX.exec(part) ??
		OPTIONAL_CATCH_ALL_DYNAMIC_SEGMENT_PART_REGEX.exec(part);

	return regExpExecArray?.groups ?? {};
};

let buildEnvVarNameFromPathParts = (pathParts: string[]) => {
	let partialEnvVar = pathParts
		.map((part) => {
			let { cpart, dspart, cadspart, ocadspart } = getRegexGroups(part);

			let somePart = cpart ?? dspart ?? cadspart ?? ocadspart ?? null;

			return somePart?.replace(/-/g, '_').toUpperCase() ?? null;
		})
		.filter(isNeitherNullNorUndefined)
		.join('_');

	return ['APP_ROUTER', partialEnvVar, 'ENABLED'].join('_');
};

let handleFile: HandleFile<Dependencies, State> = async (
	_,
	path,
	options,
	state,
) => {
	if (state === null) {
		throw new Error('The state is not set');
	}

	if (state.step === 'READING') {
		let parsedPath = parse(path);
		let directoryNames = parsedPath.dir.split(sep);

		if (!directoryNames.includes('app') || parsedPath.name !== 'page') {
			return [];
		}

		let parts = directoryNames
			.slice(directoryNames.lastIndexOf('app') + 1)
			.filter((part) => part !== 'future');

		if (state.generateAsPageGroup) {
			let [topLevelPageName] = parts;

			state.urlPatternEnvVarMap.set(
				`/${topLevelPageName}/:path*`,
				buildEnvVarNameFromPathParts([topLevelPageName]),
			);

			return [];
		}

		if (parts.length === 0) {
			return [];
		}

		let pathname = parts
			.map((part) => {
				let { cpart, dspart, cadspart, ocadspart } =
					getRegexGroups(part);

				if (cpart !== undefined) {
					return cpart;
				}

				if (dspart !== undefined) {
					return `:${dspart}`;
				}

				if (cadspart !== undefined) {
					return `:${cadspart}+`;
				}

				if (ocadspart !== undefined) {
					return `:${ocadspart}*`;
				}

				return null;
			})
			.filter(isNeitherNullNorUndefined)
			.map((part) => `/${part}`)
			.join('');

		let envVar = buildEnvVarNameFromPathParts(parts);

		state.urlPatternEnvVarMap.set(pathname, envVar);

		return [];
	}

	if (
		[
			state.turboPath,
			state.middlewarePath,
			state.abTestMiddlewarePath,
		].includes(path)
	) {
		return [
			{
				kind: 'upsertFile',
				path,
				options,
			},
		];
	}

	return [];
};

let handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	data,
	_,
	state,
) => {
	if (state === null) {
		throw new Error('The state is not set');
	}

	if (path === state.turboPath) {
		let json = JSON.parse(data);

		let globalEnv = new Set<string>(json.globalEnv);

		for (let envVar of state.urlPatternEnvVarMap.values()) {
			globalEnv.add(envVar);
		}

		let newData = JSON.stringify({
			...json,
			globalEnv: Array.from(globalEnv).sort(),
		});

		return {
			kind: 'upsertData',
			path,
			data: newData,
		};
	}

	// adds page paths to the matcher
	if (path === state.middlewarePath) {
		let { jscodeshift } = api.getDependencies();
		let j = jscodeshift.withParser('tsx');
		let root = j(data);

		root.find(j.VariableDeclaration).forEach((path) => {
			if (path.node.declarations[0].type !== 'VariableDeclarator') {
				return;
			}

			let declarator = path.node.declarations[0];

			if (
				!j.Identifier.check(declarator.id) ||
				declarator.id.name !== 'config'
			) {
				return;
			}

			if (!j.ObjectExpression.check(declarator.init)) {
				return;
			}

			let matcherProperty = declarator.init.properties.find(
				(prop) =>
					j.ObjectProperty.check(prop) &&
					j.Identifier.check(prop.key) &&
					prop.key.name === 'matcher',
			);

			if (
				matcherProperty === null ||
				!j.ObjectProperty.check(matcherProperty) ||
				!j.ArrayExpression.check(matcherProperty.value)
			) {
				return;
			}

			let urlPatterns = state.urlPatternEnvVarMap.keys();
			let literals = [...urlPatterns].flatMap((urlPattern) => [
				j.literal(urlPattern),
				j.literal(`/future${urlPattern}/`),
			]);

			matcherProperty.value.elements.push(...literals);
		});

		return { kind: 'upsertData', path, data: root.toSource() };
	}

	if (path === state.abTestMiddlewarePath) {
		let { jscodeshift } = api.getDependencies();
		let { VariableDeclarator, Program } = jscodeshift;
		let root = jscodeshift.withParser('tsx')(data);

		let buildElement = (
			pathname: string,
			envVar: string,
		): TSAsExpressionKind => {
			return {
				type: 'TSAsExpression',
				expression: {
					type: 'ArrayExpression',
					elements: [
						{
							type: 'StringLiteral',
							value: pathname,
						},
						{
							type: 'CallExpression',
							callee: {
								type: 'Identifier',
								name: 'Boolean',
							},
							arguments: [
								{
									type: 'MemberExpression',
									object: {
										type: 'MemberExpression',
										object: {
											type: 'Identifier',
											name: 'process',
										},
										property: {
											type: 'Identifier',
											name: 'env',
										},
									},
									property: {
										type: 'Identifier',
										name: envVar,
									},
								},
							],
						},
					],
				},
				typeAnnotation: {
					type: 'TSTypeReference',
					typeName: {
						type: 'Identifier',
						name: 'const',
					},
				},
			};
		};

		let elements = Array.from(state.urlPatternEnvVarMap)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map((entry) => buildElement(...entry));

		let variableDeclarator = jscodeshift.variableDeclarator(
			{
				type: 'Identifier',
				name: 'ROUTES',
				typeAnnotation: {
					type: 'TSTypeAnnotation',
					typeAnnotation: {
						type: 'TSArrayType',
						elementType: {
							type: 'TSTupleType',
							elementTypes: [
								{
									type: 'TSTypeReference',
									typeName: {
										type: 'Identifier',
										name: 'URLPattern',
									},
								},
								{
									type: 'TSBooleanKeyword',
								},
							],
						},
					},
				},
			},
			{
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'ArrayExpression',
						elements,
					},
					property: {
						type: 'Identifier',
						name: 'map',
					},
				},
				arguments: [
					{
						type: 'ArrowFunctionExpression',
						params: [
							{
								type: 'ArrayPattern',
								elements: [
									{
										type: 'Identifier',
										name: 'pathname',
									},
									{
										type: 'Identifier',
										name: 'enabled',
									},
								],
							},
						],
						body: {
							type: 'ArrayExpression',
							elements: [
								{
									type: 'NewExpression',
									callee: {
										type: 'Identifier',
										name: 'URLPattern',
									},
									arguments: [
										{
											type: 'ObjectExpression',
											properties: [
												{
													type: 'ObjectProperty',
													key: {
														type: 'Identifier',
														name: 'pathname',
													},
													value: {
														type: 'Identifier',
														name: 'pathname',
													},
													shorthand: true,
												},
											],
										},
									],
								},
								{
									type: 'Identifier',
									name: 'enabled',
								},
							],
						},
					},
				],
			},
		);

		let routesVariableDeclarators = root.find(VariableDeclarator, {
			type: 'VariableDeclarator',
			id: {
				type: 'Identifier',
				name: 'ROUTES',
			},
		});

		if (routesVariableDeclarators.length === 0) {
			let variableDeclation = jscodeshift.variableDeclaration('const', [
				variableDeclarator,
			]);

			root.find(Program).nodes()[0]?.body.push(variableDeclation);
		} else {
			routesVariableDeclarators.replaceWith(() => variableDeclarator);
		}

		let source = root.toSource();

		return { kind: 'upsertData', path, data: source };
	}

	return { kind: 'noop' };
};

let handleFinish: HandleFinish<State> = async (_, state) => {
	if (state === null) {
		throw new Error('The state is not set');
	}

	return {
		kind: state.step === 'READING' ? 'restart' : 'noop',
	};
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/*.{js,jsx,ts,tsx,json}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	initializeState,
	handleFile,
	handleData,
	handleFinish,
};
