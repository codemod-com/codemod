import type { CallExpression, Collection, JSCodeshift } from "jscodeshift";
import { analyzeImport } from "./import.js";

export const getCallExpressionsByImport = (
  j: JSCodeshift,
  root: Collection<any>,
  source: string,
): Collection<CallExpression> => {
  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = analyzeImport(j, root, source);

  const importedModuleName =
    importNamespaceSpecifierName ?? importDefaultSpecifierName;

  return root.find(j.CallExpression).filter((path) => {
    const { callee } = path.value;

    if (
      j.Identifier.check(callee) &&
      importSpecifierLocalNames.has(callee.name)
    ) {
      return true;
    }

    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === importedModuleName &&
      j.Identifier.check(callee.property)
    ) {
      return true;
    }

    return false;
  });
};
