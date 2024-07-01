import type { CallExpression, Collection, JSCodeshift } from "jscodeshift";
import { analyzeImport } from "./import.js";

export const getCallExpressionsByImport = (
  j: JSCodeshift,
  root: Collection<any>,
  source: string,
  names: string[],
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

    const localNames = names.map((name) => importSpecifierLocalNames.get(name));

    if (j.Identifier.check(callee) && localNames.includes(callee.name)) {
      return true;
    }

    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === importedModuleName &&
      j.Identifier.check(callee.property) &&
      names.includes(callee.property.name)
    ) {
      return true;
    }

    return false;
  });
};
