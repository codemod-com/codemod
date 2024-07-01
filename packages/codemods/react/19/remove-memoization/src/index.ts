import {
  getCallExpressionsByImport,
  removeUnusedSpecifiers,
} from "@codemod-com/jscodeshift-utils";
import type { API, FileInfo } from "jscodeshift";
export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  const hooksToRemove = ["useMemo", "useCallback", "memo"];

  getCallExpressionsByImport(j, root, "react", hooksToRemove).replaceWith(
    (path) => {
      isDirty = true;

      return path.value.arguments[0];
    },
  );

  if (isDirty) {
    removeUnusedSpecifiers(j, root, "react");
  }

  return isDirty ? root.toSource() : undefined;
}
