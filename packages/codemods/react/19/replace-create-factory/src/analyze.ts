import { getCallExpressionsByImport } from "@codemod-com/jscodeshift-utils";
import type { Collection, JSCodeshift } from "jscodeshift";

export const findPatterns = (j: JSCodeshift, root: Collection) =>
  getCallExpressionsByImport(j, root, "react").filter(
    (path) =>
      j.Identifier.check(path.value.callee) &&
      path.value.callee.name === "createFactory",
  );
