import type {
  ASTPath,
  CallExpression,
  Collection,
  Expression,
  ImportDeclaration,
  JSCodeshift,
  MemberExpression,
} from "jscodeshift";

import {
  getNamedImportLocalName,
  importDeclarationHasLocalName,
} from "./import-declaration.js";

const getMemberExpressionRootObject = (
  j: JSCodeshift,
  memberExpression: MemberExpression,
) => {
  const { object } = memberExpression;

  if (j.Identifier.check(object)) {
    return object;
  }

  if (j.MemberExpression.check(object)) {
    return getMemberExpressionRootObject(j, object);
  }

  return null;
};

/**
 * Retrieves the name of the callee in a CallExpression.
 *
 * If the callee is an Identifier, it returns the name of the Identifier.
 * If the callee is a MemberExpression, it recursively retrieves the name of the root object of the MemberExpression.
 * If the callee is neither an Identifier nor a MemberExpression, it returns null.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param callee - The Expression representing the callee of a CallExpression.
 * @returns The name of the callee, or null if the callee is not an Identifier or MemberExpression.
 */
export const getCalleeName = (j: JSCodeshift, callee: Expression) => {
  if (j.Identifier.check(callee)) {
    return callee.name;
  }

  if (j.MemberExpression.check(callee)) {
    const rootObject = getMemberExpressionRootObject(j, callee);

    return rootObject?.name;
  }

  return null;
};

/**
 * Retrieves all CallExpression nodes in the given AST root that have a callee imported from the specified ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param root - The root AST node to search for CallExpression nodes.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @returns A collection of CallExpression nodes whose callee is imported from the given ImportDeclaration.
 */
export const getCallExpressionsByImport = (
  j: JSCodeshift,
  root: Collection<any>,
  importDeclaration: ASTPath<ImportDeclaration>,
): Collection<CallExpression> => {
  return root
    .find(j.CallExpression)
    .filter((callExpression) =>
      isCalleeImportedFromImportDeclaration(
        j,
        importDeclaration,
        callExpression,
      ),
    );
};

/**
 * Checks if the callee of a CallExpression is imported from the specified ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @param callExpression - The CallExpression AST node being checked.
 * @returns A boolean indicating whether the callee of the CallExpression is imported from the specified ImportDeclaration.
 */
export const isCalleeImportedFromImportDeclaration = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
  callExpression: ASTPath<CallExpression>,
): boolean => {
  const { callee } = callExpression.value;

  const calleeName = getCalleeName(j, callee);

  return (
    !!calleeName &&
    importDeclarationHasLocalName(j, calleeName, importDeclaration)
  );
};

/**
 * Checks if a CallExpression's callee is a known library method imported from the specified ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param callExpression - The CallExpression AST node being checked.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @param knownMethodNames - An array of known library method names to check against.
 * @returns A boolean indicating whether the callee of the CallExpression is a known library method imported from the specified ImportDeclaration.
 */
export const isCallExpressionLibraryMethod = (
  j: JSCodeshift,
  callExpression: ASTPath<CallExpression>,
  importDeclaration: ASTPath<ImportDeclaration>,
  knownMethodNames: string[],
): boolean => {
  const importedFromLibrary = isCalleeImportedFromImportDeclaration(
    j,
    importDeclaration,
    callExpression,
  );

  const { callee } = callExpression.value;

  // If callee is identifier, we need to check first if its imported form lib
  // then check if "local names" of known library methods includes the callee name
  if (j.Identifier.check(callee)) {
    return (
      importedFromLibrary &&
      knownMethodNames.some(
        (name) =>
          getNamedImportLocalName(j, name, importDeclaration) === callee.name,
      )
    );
  }

  // If callee is member expression, we want to check if the member expression root object is imported from lib
  // and if member expression property is known method name
  if (j.MemberExpression.check(callee) && j.Identifier.check(callee.property)) {
    return (
      importedFromLibrary && knownMethodNames.includes(callee.property.name)
    );
  }

  return false;
};
