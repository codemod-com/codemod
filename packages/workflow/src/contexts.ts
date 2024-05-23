import { AsyncLocalStorage } from "node:async_hooks";
import type { SgNode } from "@ast-grep/napi";

import { invariant } from "ts-invariant";
import { noContextFn } from "./helpers";

const registeredContexts = new Map<string, AsyncLocalStorage<any>>();

export const registerContext = <T>(name: string, ctx: AsyncLocalStorage<T>) => {
  registeredContexts.set(name, ctx);
  return ctx;
};

export type AstGrepNodeContext = {
  node: SgNode;
  contents: string;
};

export const parentContext = new AsyncLocalStorage<(...args: any[]) => any>();

export const getParentContext = () => {
  const fn = parentContext.getStore();

  return fn ?? noContextFn;
};

export const astGrepNodeContext = registerContext(
  "astGrepNodeContext",
  new AsyncLocalStorage<AstGrepNodeContext>(),
);
export const describeContext = registerContext(
  "describeContext",
  new AsyncLocalStorage<{ name: string }>(),
);
export const migrateContext = registerContext(
  "migrateContext",
  new AsyncLocalStorage<{ name: string }>(),
);
export const cwdContext = registerContext(
  "cwdContext",
  new AsyncLocalStorage<{
    cwd: string;
  }>(),
);
export const fileContext = registerContext(
  "fileContext",
  new AsyncLocalStorage<{
    file: string;
    importsUpdates: { type: "add" | "remove"; import: string }[];
  }>(),
);
export const repositoryContext = registerContext(
  "repositoryContext",
  new AsyncLocalStorage<{
    repository: string;
    branch: string;
  }>(),
);
export const repositoriesContext = registerContext(
  "repositoriesContext",
  new AsyncLocalStorage<{
    repositories: string[];
  }>(),
);

export const getContextsSnapshot = () => {
  return [...registeredContexts.entries()]
    .map(([name, ctx]) => [name, ctx.getStore()])
    .filter(([, store]) => typeof store !== "undefined");
};

export const getAstGrepNodeContext = () => {
  const ctx = astGrepNodeContext.getStore();
  invariant(ctx, "No ast-grep node context found");
  return ctx;
};

export const getCwdContext = () => {
  const cwd = cwdContext.getStore();

  return cwd ?? { cwd: process.cwd() };
};

export const getFileContext = () => {
  const file = fileContext.getStore();
  invariant(file, "No file context found");
  return file;
};

export const getRepositoryContext = () => {
  const repo = repositoryContext.getStore();
  invariant(repo, "No repository context found");
  return repo;
};

export const getRepositoriesContext = () => {
  const repo = repositoriesContext.getStore();
  invariant(repo, "No repositories context found");
  return repo;
};

export const getDescribeContext = () => {
  const repo = describeContext.getStore();
  invariant(repo, "No describe context found");
  return repo;
};
