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
 * Retrieves all CallExpression nodes from the root Collection that use functions imported by the given ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param root - The root Collection representing the AST of the source code.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @returns A Collection of CallExpression nodes that correspond to the imported functions.
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
 * Checks if the callee of a CallExpression is imported from the given ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @param callExpression - The CallExpression AST node whose callee is being checked.
 * @returns A boolean indicating whether the callee is imported from the given ImportDeclaration.
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
 * Checks if the given CallExpression is a known method call from a given library.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param callExpression - The CallExpression AST node being checked.
 * @param importDeclaration - The ImportDeclaration AST node to match the imported functions against.
 * @param knownMethodNames - An array of method names known to be imported from the library.
 * @returns A boolean indicating whether the CallExpression is a method call from the known library.
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
