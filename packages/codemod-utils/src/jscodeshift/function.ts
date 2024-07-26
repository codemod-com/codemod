import type {
  ASTPath,
  ArrowFunctionExpression,
  Collection,
  FunctionDeclaration,
  FunctionExpression,
  JSCodeshift,
} from "jscodeshift";

import { getDefaultExport, isDefinedInGlobalScope } from "./global.js";

export type FunctionLike =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression;

/**
 * Retrieves the name of a function-like node.
 *
 * @param j - The JSCodeshift instance.
 * @param path - The AST path to the function-like node.
 * @returns The name of the function, or null if it has no name.
 */
export const getFunctionName = (
  j: JSCodeshift,
  path: ASTPath<FunctionLike>,
): string | null =>
  j.ArrowFunctionExpression.check(path.value) &&
  j.VariableDeclarator.check(path.parent.value) &&
  j.Identifier.check(path.parent.value.id)
    ? path.parent.value.id.name
    : path.value.id?.name ?? null;

/**
 * Checks if a function-like node is exported as the default export.
 *
 * @param j - The JSCodeshift instance.
 * @param root - The root collection of the AST.
 * @param path - The AST path to the function-like node.
 * @returns True if the function is exported as the default export, false otherwise.
 */
export const isFunctionExportedByDefault = (
  j: JSCodeshift,
  root: Collection<any>,
  path: ASTPath<FunctionLike>,
): boolean => {
  if (!isDefinedInGlobalScope(j, path)) {
    return false;
  }

  const defaultExport = getDefaultExport(j, root);
  const defaultExportDeclaration = defaultExport?.value.declaration;

  if (j.FunctionDeclaration.check(defaultExportDeclaration)) {
    return path.value === defaultExportDeclaration;
  }

  if (j.Identifier.check(defaultExportDeclaration)) {
    return getFunctionName(j, path) === defaultExportDeclaration.name;
  }

  return false;
};
