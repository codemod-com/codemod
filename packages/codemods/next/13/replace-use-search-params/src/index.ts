import type { Filemod, HandleFile } from '@codemod-com/filemod';
import type {
	CallExpression,
	Collection,
	File,
	ImportDeclaration,
	JSCodeshift,
} from 'jscodeshift';
import type jscodeshift from 'jscodeshift';

type State = {
	hookModuleCreated: boolean;
	hookModuleSpecifier: string;
	hookPathType: 'relative' | 'absolute';
	hookPath: string;
	hookModuleCreation: boolean;
};

type ModFunction<T, D extends 'read' | 'write'> = (
	j: JSCodeshift,
	root: Collection<T>,
	settings: State,
) => [D extends 'write' ? boolean : false, ReadonlyArray<LazyModFunction>];

type LazyModFunction = [
	ModFunction<any, 'read' | 'write'>,
	Collection<any>,
	State,
];

type Dependencies = {
	jscodeshift: typeof jscodeshift;
};

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];

export let USE_COMPAT_SEARCH_PARAMS_HOOK_CONTENT = `
import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";

export const useCompatSearchParams = () => {
  const _searchParams = useSearchParams() ?? new URLSearchParams();
  const params = useParams() ?? {};

  const searchParams = new URLSearchParams(_searchParams.toString());
  Object.getOwnPropertyNames(params).forEach((key) => {
    searchParams.delete(key);

    const param = params[key];
    const paramArr = typeof param === "string" ? param.split("/") : param;

    paramArr.forEach((p) => {
      searchParams.append(key, p);
    });
  });

  return new ReadonlyURLSearchParams(searchParams);
};

`;

let replaceCallExpression: ModFunction<CallExpression, 'write'> = (
	j,
	callExpression,
) => {
	callExpression.replaceWith(
		j.callExpression(j.identifier('useCompatSearchParams'), []),
	);

	return [true, []];
};

let findCallExpressions: ModFunction<File, 'read'> = (j, root, settings) => {
	let lazyModFunctions: LazyModFunction[] = [];

	root.find(j.CallExpression, {
		callee: {
			type: 'Identifier',
			name: 'useSearchParams',
		},
	}).forEach((callExpressionPath) => {
		lazyModFunctions.push([
			replaceCallExpression,
			j(callExpressionPath),
			settings,
		]);
	});

	return [false, lazyModFunctions];
};

let addImportDeclaration: ModFunction<File, 'write'> = (
	j,
	root,
	{ hookModuleSpecifier },
) => {
	root.find(j.Program).forEach((programPath) => {
		programPath.value.body.unshift(
			j.importDeclaration(
				[j.importSpecifier(j.identifier('useCompatSearchParams'))],
				j.literal(hookModuleSpecifier),
			),
		);
	});

	return [false, []];
};

let replaceImportDeclaration: ModFunction<ImportDeclaration, 'write'> = (
	j,
	importDeclaration,
) => {
	let shouldBeRemoved = false;
	importDeclaration.forEach((importDeclarationPath) => {
		importDeclarationPath.value.specifiers =
			importDeclarationPath.value.specifiers?.filter((specifier) => {
				return (
					!j.ImportSpecifier.check(specifier) ||
					specifier.imported.name !== 'useSearchParams'
				);
			});

		if (importDeclarationPath.value.specifiers?.length === 0) {
			shouldBeRemoved = true;
		}
	});

	if (shouldBeRemoved) {
		importDeclaration.remove();
	}

	return [true, []];
};

let findImportDeclaration: ModFunction<File, 'read'> = (j, root, settings) => {
	let lazyModFunctions: LazyModFunction[] = [];

	root.find(j.ImportDeclaration, {
		source: {
			value: 'next/navigation',
		},
	}).forEach((importDeclarationPath) => {
		lazyModFunctions.push([
			replaceImportDeclaration,
			j(importDeclarationPath),
			settings,
		]);
	});

	return [false, lazyModFunctions];
};

function transform(
	jscodeshift: JSCodeshift,
	data: string,
	settings: State,
): string | undefined {
	let dirtyFlag = false;
	let j = jscodeshift.withParser('tsx');
	let root = j(data);

	let lazyModFunctions: LazyModFunction[] = [
		[findCallExpressions, root, settings],
	];

	let handleLazyModFunction = (lazyModFunction: LazyModFunction) => {
		let [modFunction, localCollection, localSettings] = lazyModFunction;

		let [localDirtyFlag, localLazyModFunctions] = modFunction(
			j,
			localCollection,
			localSettings,
		);

		dirtyFlag ||= localDirtyFlag;

		for (let localLazyModFunction of localLazyModFunctions) {
			handleLazyModFunction(localLazyModFunction);
		}
	};

	for (let lazyModFunction of lazyModFunctions) {
		handleLazyModFunction(lazyModFunction);
	}

	if (!dirtyFlag) {
		return undefined;
	}

	handleLazyModFunction([findImportDeclaration, root, settings]);
	handleLazyModFunction([addImportDeclaration, root, settings]);

	return root.toSource();
}

let noop = {
	kind: 'noop',
} as const;

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/*.{jsx,tsx,js,ts,cjs,ejs}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	initializeState: async (options, previousState) => {
		let {
			useCompatSearchParamsHookAbsolutePath,
			useCompatSearchParamsHookRelativePath,
			useCompatSearchParamsHookModuleSpecifier,
		} = options;

		let absolutePathPresent =
			typeof useCompatSearchParamsHookAbsolutePath === 'string' &&
			useCompatSearchParamsHookAbsolutePath !== '';

		let relativePathPresent =
			typeof useCompatSearchParamsHookRelativePath === 'string' &&
			useCompatSearchParamsHookRelativePath !== '';

		let hookPathType = absolutePathPresent
			? 'absolute'
			: relativePathPresent
				? 'relative'
				: null;

		let hookPath = absolutePathPresent
			? useCompatSearchParamsHookAbsolutePath
			: relativePathPresent
				? useCompatSearchParamsHookRelativePath
				: null;

		if (
			hookPathType === null ||
			hookPath === null ||
			typeof useCompatSearchParamsHookModuleSpecifier !== 'string'
		) {
			throw new Error(
				'Neither the absolute nor the relative hook paths are present in the options',
			);
		}

		let hookModuleCreation =
			typeof options.hookModuleCreation === 'boolean'
				? options.hookModuleCreation
				: true;

		return (
			previousState ?? {
				hookModuleCreated: false,
				hookPathType,
				hookPath,
				hookModuleSpecifier: useCompatSearchParamsHookModuleSpecifier,
				hookModuleCreation,
			}
		);
	},
	handleFile: async (api, path, options, state) => {
		let commands: FileCommand[] = [];

		if (state?.hookModuleCreation && !state.hookModuleCreated) {
			if (state.hookPathType === 'relative') {
				let hookPath = api.joinPaths(
					api.currentWorkingDirectory,
					state.hookPath,
				);

				let hookPathExists = api.exists(hookPath);

				if (!hookPathExists) {
					commands.push({
						kind: 'upsertFile',
						path: hookPath,
						options: {
							...options,
							fileContent: USE_COMPAT_SEARCH_PARAMS_HOOK_CONTENT,
						},
					});
				}

				state.hookModuleCreated = true;
			} else if (state.hookPathType === 'absolute') {
				let hookPathExists = api.exists(state.hookPath);

				if (!hookPathExists) {
					commands.push({
						kind: 'upsertFile',
						path: state.hookPath,
						options: {
							...options,
							fileContent: USE_COMPAT_SEARCH_PARAMS_HOOK_CONTENT,
						},
					});
				}

				state.hookModuleCreated = true;
			}
		}

		commands.push({
			kind: 'upsertFile',
			path,
			options,
		});

		return commands;
	},
	handleData: async (api, path, data, options, state) => {
		if (!state) {
			throw new Error('Could not find state.');
		}

		if (
			'fileContent' in options &&
			typeof options.fileContent === 'string'
		) {
			return {
				kind: 'upsertData',
				path,
				data: options.fileContent,
			};
		}

		let { jscodeshift } = api.getDependencies();

		let rewrittenData = transform(jscodeshift, data, state);

		if (rewrittenData === undefined) {
			return noop;
		}

		return {
			kind: 'upsertData',
			path,
			data: rewrittenData,
		};
	},
};
