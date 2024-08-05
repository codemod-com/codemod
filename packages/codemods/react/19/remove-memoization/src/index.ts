import {
  getImportDeclaration,
  isCallExpressionLibraryMethod,
  removeUnusedSpecifiers,
} from "@codemod.com/codemod-utils";
import type { API, FileInfo } from "jscodeshift";
export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  const hooksToRemove = ["useMemo", "useCallback", "memo"];
  const importDeclaration = getImportDeclaration(j, root, "react");

  if (!importDeclaration) {
    return undefined;
  }

  root
    .find(j.CallExpression)
    .filter((callExpression) => {
      return isCallExpressionLibraryMethod(
        j,
        callExpression,
        importDeclaration,
        hooksToRemove,
      );
    })
    .replaceWith((path) => {
      isDirty = true;

      return path.value.arguments[0];
    });

  if (isDirty) {
    const importDeclaration = getImportDeclaration(j, root, "react");

    if (importDeclaration) {
      removeUnusedSpecifiers(j, root, importDeclaration);
    }
  }

  return isDirty ? root.toSource() : undefined;
}
