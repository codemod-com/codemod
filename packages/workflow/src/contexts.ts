import { AsyncLocalStorage } from 'node:async_hooks';
import type { NapiConfig, SgNode } from '@ast-grep/napi';
import type MagicString from 'magic-string';

import { invariant } from 'ts-invariant';
import { noContextFn } from './helpers';

let registeredContexts = new Map<string, AsyncLocalStorage<any>>();

export let registerContext = <T,>(name: string, ctx: AsyncLocalStorage<T>) => {
	registeredContexts.set(name, ctx);
	return ctx;
};

export type AstGrepNodeContext = {
	query: string | NapiConfig;
	node: SgNode;
	contents: MagicString;
};

export let parentContext = new AsyncLocalStorage<(...args: any[]) => any>();

export let getParentContext = () => {
	let fn = parentContext.getStore();

	return fn ?? noContextFn;
};

export let astGrepNodeContext = registerContext(
	'astGrepNodeContext',
	new AsyncLocalStorage<AstGrepNodeContext>(),
);
export let describeContext = registerContext(
	'describeContext',
	new AsyncLocalStorage<{ name: string }>(),
);
export let migrateContext = registerContext(
	'migrateContext',
	new AsyncLocalStorage<{ name: string }>(),
);
export let cwdContext = registerContext(
	'cwdContext',
	new AsyncLocalStorage<{
		cwd: string;
	}>(),
);
export let fileContext = registerContext(
	'fileContext',
	new AsyncLocalStorage<{
		file: string;
		importsUpdates: { type: 'add' | 'remove'; import: string }[];
	}>(),
);
export let repositoryContext = registerContext(
	'repositoryContext',
	new AsyncLocalStorage<{
		repository: string;
		branch: string;
	}>(),
);
export let repositoriesContext = registerContext(
	'repositoriesContext',
	new AsyncLocalStorage<{
		repositories: string[];
	}>(),
);

export let getContextsSnapshot = () => {
	return [...registeredContexts.entries()]
		.map(([name, ctx]) => [name, ctx.getStore()])
		.filter(([, store]) => typeof store !== 'undefined');
};

export let getAstGrepNodeContext = () => {
	let ctx = astGrepNodeContext.getStore();
	invariant(ctx, 'No ast-grep node context found');
	return ctx;
};

export let getCwdContext = () => {
	let cwd = cwdContext.getStore();

	return cwd ?? { cwd: process.cwd() };
};

export let getFileContext = () => {
	let file = fileContext.getStore();
	invariant(file, 'No file context found');
	return file;
};

export let getRepositoryContext = () => {
	let repo = repositoryContext.getStore();
	invariant(repo, 'No repository context found');
	return repo;
};

export let getRepositoriesContext = () => {
	let repo = repositoriesContext.getStore();
	invariant(repo, 'No repositories context found');
	return repo;
};

export let getDescribeContext = () => {
	let repo = describeContext.getStore();
	invariant(repo, 'No describe context found');
	return repo;
};
