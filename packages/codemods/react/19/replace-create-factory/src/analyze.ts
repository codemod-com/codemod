import { getCallExpressionsByImport } from "@codemod-com/jscodeshift-utils";
import type { Collection, JSCodeshift } from "jscodeshift";

export const findPatterns = (j: JSCodeshift, root: Collection) =>
  getCallExpressionsByImport(j, root, "react", ["createFactory"]);
