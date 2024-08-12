import {
  getImportDeclaration,
  isCallExpressionLibraryMethod,
} from "@codemod.com/codemod-utils";
import type { Collection, JSCodeshift } from "jscodeshift";

export const findPatterns = (j: JSCodeshift, root: Collection) => {
  const importDeclaration = getImportDeclaration(j, root, "react");

  return importDeclaration
    ? root.find(j.CallExpression).filter((callExpression) => {
        return isCallExpressionLibraryMethod(
          j,
          callExpression,
          importDeclaration,
          ["createFactory"],
        );
      })
    : null;
};
