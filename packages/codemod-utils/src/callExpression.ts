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
  getNamedImportImportedName,
  importDeclarationHasLocalName,
} from "./importDeclaration.js";

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
 * Checks if some call expression callee imported from specific source
 */
const isCalleeImportedFromImportDeclaration = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
  callExpression: ASTPath<CallExpression>,
) => {
  const { callee } = callExpression.value;

  const calleeName = getCalleeName(j, callee);

  return (
    !!calleeName &&
    importDeclarationHasLocalName(j, calleeName, importDeclaration)
  );
};

// @TODO naming
export const isLibraryMethod = (
  j: JSCodeshift,
  callExpression: ASTPath<CallExpression>,
  importDeclaration: ASTPath<ImportDeclaration>,
  knownImportedNames: string[],
) => {
  const importedFromImportDeclaration = isCalleeImportedFromImportDeclaration(
    j,
    importDeclaration,
    callExpression,
  );

  const { callee } = callExpression.value;

  if (j.Identifier.check(callee)) {
    return (
      importedFromImportDeclaration &&
      knownImportedNames.some(
        (name) =>
          getNamedImportImportedName(j, name, importDeclaration) ===
          callee.name,
      )
    );
  }

  if (j.MemberExpression.check(callee) && j.Identifier.check(callee.property)) {
    return (
      importedFromImportDeclaration &&
      knownImportedNames.includes(callee.property.name)
    );
  }

  return false;
};
