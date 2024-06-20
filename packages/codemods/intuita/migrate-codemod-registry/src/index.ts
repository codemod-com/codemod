import { format, parse, sep } from 'node:path';
import type {
	Filemod,
	HandleData,
	HandleFile,
	HandleFinish,
	InitializeState,
} from '@codemod-com/filemod';
import type jscodeshift from 'jscodeshift';

type Dependencies = {
	jscodeshift: typeof jscodeshift;
};
type State = {
	step: 'UPSERTING_CODEMODS' | 'UPSERTING_WORKSPACES';
	workspaces: Set<string>;
};

let isNeitherNullNorUndefined = <T,>(
	t: NonNullable<T> | null | undefined,
): t is NonNullable<T> => t !== null && t !== undefined;

let initializeState: InitializeState<State> = async (_, state) => {
	if (state === null) {
		return {
			step: 'UPSERTING_CODEMODS',
			workspaces: new Set(),
		};
	}

	return {
		step: 'UPSERTING_WORKSPACES',
		workspaces: state.workspaces,
	};
};

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];

let handleFile: HandleFile<Dependencies, State> = async (
	api,
	path,
	options,
	state,
) => {
	let parsedCwd = parse(
		api.joinPaths(api.currentWorkingDirectory, 'placeholder.txt'),
	);
	let parsedPath = parse(path);

	let cwdDirectoryNames = parsedCwd.dir.split(sep);
	let pathDirectoryNames = parsedPath.dir.split(sep);

	if (
		['cjs-builder', 'builder', 'utilities', 'tsconfig'].some((name) =>
			pathDirectoryNames.includes(name),
		)
	) {
		return [];
	}

	if (!['.ts', '.js', '.json', '.md', '.toml'].includes(parsedPath.ext)) {
		return [];
	}

	let directoryName = pathDirectoryNames
		.map((name, i) => (name !== cwdDirectoryNames[i] ? name : null))
		.filter(isNeitherNullNorUndefined);

	if (directoryName.length === 0) {
		if (parsedPath.base === 'package.json') {
			return [
				{
					kind: 'upsertFile',
					path: api.joinPaths(
						api.currentWorkingDirectory,
						'pnpm-workspace.yaml',
					),
					options,
				},
			];
		}

		return [];
	}

	let newPath = api.joinPaths(
		api.currentWorkingDirectory,
		'codemods',
		...directoryName,
		parsedPath.name === 'index'
			? 'src'
			: parsedPath.name === 'test' && directoryName.at(-1) !== 'test'
				? 'test'
				: '',
		parsedPath.base,
	);

	let data = await api.readFile(path);

	let commands: FileCommand[] = [
		{
			kind: 'upsertFile',
			path: newPath,
			options: {
				...options,
				data,
			},
		},
	];

	if (parsedPath.base === '.codemodrc.json') {
		let parsedData = JSON.parse(data);

		let { engine } = parsedData;

		state?.workspaces.add(
			api.joinPaths('codemods', ...directoryName.slice(0, -1), '*'),
		);

		let indexTsPath = format({
			root: parsedPath.root,
			dir: parsedPath.dir,
			base: 'index.ts',
		});

		let testTsPath = format({
			root: parsedPath.root,
			dir: parsedPath.dir,
			base: 'test.ts',
		});

		let embeddedTestTsPath = format({
			root: parsedPath.root,
			dir: `${parsedPath.dir}/test`,
			base: 'test.ts',
		});

		let indexTsDoesExist = api.exists(indexTsPath);

		let testTsDoesExist =
			api.exists(testTsPath) || api.exists(embeddedTestTsPath);

		{
			let packageJsonPath = api.joinPaths(
				api.currentWorkingDirectory,
				'codemods',
				...directoryName,
				'package.json',
			);

			let name = `@codemod-com/registry/${directoryName
				.join('-')
				.toLowerCase()
				.replace(/ /, '-')}`;

			commands.push({
				kind: 'upsertFile',
				path: packageJsonPath,
				options: {
					...options,
					name,
					engine,
					extension: indexTsDoesExist ? 'ts' : 'js',
					testTsDoesExist,
				},
			});
		}

		let jsEngineUsed = engine !== 'recipe' && engine !== 'piranha';

		if (jsEngineUsed) {
			let tsconfigJsonPath = api.joinPaths(
				api.currentWorkingDirectory,
				'codemods',
				...directoryName,
				'tsconfig.json',
			);

			commands.push({
				kind: 'upsertFile',
				path: tsconfigJsonPath,
				options,
			});
		}

		if (jsEngineUsed) {
			let mocharcPath = api.joinPaths(
				api.currentWorkingDirectory,
				'codemods',
				...directoryName,
				'.mocharc.json',
			);

			commands.push({
				kind: 'upsertFile',
				path: mocharcPath,
				options: {
					...options,
				},
			});
		}

		if (jsEngineUsed) {
			let indexDtsPath = api.joinPaths(
				api.currentWorkingDirectory,
				'codemods',
				...directoryName,
				'index.d.ts',
			);

			commands.push({
				kind: 'upsertFile',
				path: indexDtsPath,
				options: {
					...options,
					engine,
				},
			});
		}
	}

	return commands;
};

let handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	__,
	options,
	state,
) => {
	if (state === null) {
		throw new Error('The state is not set');
	}

	if (state.step === 'UPSERTING_CODEMODS') {
		if (path.endsWith('package.json')) {
			let name = typeof options.name === 'string' ? options.name : null;

			let engine =
				typeof options.engine === 'string' ? options.engine : null;

			let extension =
				typeof options.extension === 'string'
					? options.extension
					: null;

			let testTsDoesExist =
				typeof options.testTsDoesExist === 'boolean'
					? options.testTsDoesExist
					: false;

			if (name === null || engine === null || extension === null) {
				throw new Error(
					'Name and engine need to be defined for package.json',
				);
			}

			let jsEngineUsed = engine !== 'recipe' && engine !== 'piranha';

			let dependencies: Record<string, string> | undefined = jsEngineUsed
				? {}
				: undefined;

			let devDependencies: Record<string, string> | undefined =
				jsEngineUsed
					? {
							'@codemod-com/tsconfig': 'workspace:*',
							'@codemod-com/utilities': 'workspace:*',
							typescript: '^5.2.2',
							esbuild: '0.19.5',
							mocha: '^10.2.0',
							'@types/mocha': '^10.0.4',
							'ts-node': '^10.9.1',
						}
					: undefined;

			if (devDependencies !== undefined && engine === 'jscodeshift') {
				devDependencies.jscodeshift = '^0.15.1';
				devDependencies['@types/jscodeshift'] = '^0.11.10';
			} else if (devDependencies !== undefined && engine === 'ts-morph') {
				devDependencies['ts-morph'] = '^19.0.0';
			} else if (devDependencies !== undefined && engine === 'filemod') {
				devDependencies['@codemod-com/filemod'] = '1.1.0';
				// this might be required sometimes
				devDependencies.memfs = '^4.6.0';
				devDependencies['ts-morph'] = '^19.0.0';
				devDependencies.jscodeshift = !path.includes(
					'remove-get-static-props',
				)
					? '^0.15.1'
					: '0.14.0';
				devDependencies['@types/jscodeshift'] = '^0.11.10';
			}

			if (dependencies && path.includes('ember/5/no-implicit-this')) {
				dependencies['ember-codemods-telemetry-helpers'] = '^3.0.0';
				dependencies['ember-template-recast'] = '^6.1.4';
				dependencies.debug = '^4.3.4';
			}

			if (
				dependencies &&
				path.includes('next/13/move-css-in-js-styles')
			) {
				dependencies.sinon = '^15.0.1';
			}

			if (
				dependencies &&
				(path.includes('app-directory-boilerplate') ||
					path.includes('replace-next-head'))
			) {
				dependencies['mdast-util-from-markdown'] = '^2.0.0';
				dependencies['mdast-util-to-markdown'] = '^2.1.0';
				dependencies['micromark-extension-mdxjs'] = '^2.0.0';
				dependencies['mdast-util-mdx'] = '^3.0.0';
				dependencies['unist-util-visit'] = '^5.0.0';
			}

			if (dependencies && path.includes('replace-next-head')) {
				dependencies['unist-util-filter'] = '^5.0.1';
			}

			let main = jsEngineUsed ? './dist/index.cjs' : undefined;
			let types = jsEngineUsed ? '/dist/index.d.ts' : undefined;

			let scripts: Record<string, string> | undefined = jsEngineUsed
				? {
						'build:cjs': `cjs-builder ./src/index.${extension}`,
					}
				: undefined;

			if (scripts !== undefined && testTsDoesExist) {
				scripts.test = 'mocha';
			}

			let files: string[] = ['README.md', '.codemodrc.json'];

			if (jsEngineUsed) {
				files.push('./dist/index.cjs', './index.d.ts');
			}

			let data = JSON.stringify({
				name,
				dependencies,
				devDependencies,
				main,
				types,
				scripts,
				files,
				type: 'module',
			});

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		if (path.endsWith('index.d.ts')) {
			let engine =
				typeof options.engine === 'string' ? options.engine : null;

			if (engine === null) {
				throw new Error(
					'Name and engine need to be defined for package.json',
				);
			}

			let data =
				engine === 'jscodeshift'
					? [
							"import type { API, FileInfo } from 'jscodeshift';",
							'export default function transform(file: FileInfo, api: API): string;',
						].join('\n')
					: engine === 'ts-morph'
						? [
								"import type { SourceFile } from 'ts-morph';",
								'export function handleSourceFile(sourceFile: SourceFile): string | undefined;',
							].join('\n')
						: engine === 'filemod'
							? [
									"import type { Filemod } from '@codemod-com/filemod';",
									'export const repomod: Filemod<{}, {}>;',
								].join('\n')
							: '';

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		if (path.endsWith('.mocharc.json')) {
			let data = JSON.stringify({
				loader: ['ts-node/esm'],
				'full-trace': true,
				failZero: false,
				bail: true,
				spec: './**/test.ts',
				timeout: 5000,
			});

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		if (path.endsWith('tsconfig.json')) {
			let data = JSON.stringify({
				extends: '@codemod-com/tsconfig',
				include: [
					'./src/**/*.ts',
					'./src/**/*.js',
					'./test/**/*.ts',
					'./test/**/*.js',
				],
			});

			return {
				kind: 'upsertData',
				path,
				data,
			};
		}

		if (path.endsWith('test.ts')) {
			let data = typeof options.data === 'string' ? options.data : null;

			if (data === null) {
				throw new Error('Data must be present for test.ts files');
			}

			let { jscodeshift: j } = api.getDependencies();

			let root = j.withParser('tsx')(data);

			// adapted from codemod.com/studio AI
			let dirtyFlag = false;

			root.find(j.ImportDeclaration).forEach((path) => {
				if (path.node.type === 'ImportDeclaration') {
					if (path.node.source.value === './index.js') {
						path.node.source.value = '../src/index.js';
						dirtyFlag = true;
					}

					if (path.node.source.value === '../index.js') {
						path.node.source.value = '../src/index.js';
						dirtyFlag = true;
					}

					if (
						path.node.source.value
							?.toString()
							.endsWith('../utilities.js')
					) {
						path.node.source.value = '@codemod-com/utilities';
						dirtyFlag = true;
					}
				}
			});

			return {
				kind: 'upsertData',
				path,
				data: dirtyFlag ? root.toSource() : data,
			};
		}

		if (typeof options.data === 'string') {
			return {
				kind: 'upsertData',
				path,
				data: options.data,
			};
		}

		return { kind: 'noop' };
	}

	if (
		state.step === 'UPSERTING_WORKSPACES' &&
		path.endsWith('pnpm-workspace.yaml')
	) {
		let workspaces = Array.from(state.workspaces).sort();
		workspaces.unshift('builder');
		workspaces.unshift('utilities');
		workspaces.unshift('tsconfig');
		workspaces.unshift('cjs-builder');

		let data = [
			'packages:',
			...workspaces.map((workspace) => `  - './${workspace}'`),
			'',
		].join('\n');

		return {
			kind: 'upsertData',
			path,
			data,
		};
	}

	return { kind: 'noop' };
};

let handleFinish: HandleFinish<State> = async (_, state) => {
	if (state === null) {
		throw new Error('The state is not set');
	}

	return {
		kind: state.step === 'UPSERTING_CODEMODS' ? 'restart' : 'noop',
	};
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/**/*.{js,ts,json,md,toml}'],
	excludePatterns: ['**/node_modules/**', '**/build/**', '**/codemods/**'],
	initializeState,
	handleFile,
	handleData,
	handleFinish,
};
