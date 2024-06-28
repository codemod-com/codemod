import { removeUnusedSpecifiers } from "@codemod-com/jscodeshift-utils";
import type { API, FileInfo, JSCodeshift } from "jscodeshift";
import { findPatterns } from "./analyze.js";

const buildJsxSelfClosingElement = (j: JSCodeshift, name: string) =>
  j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier(name), [], true));

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  findPatterns(j, root).forEach((path) => {
    const arg0 = path.value.arguments.at(0);

    if (!arg0) {
      return;
    }

    // createFactory with tag name string
    // createFactory("button") ===> <button />
    if (j.StringLiteral.check(arg0)) {
      path.replace(buildJsxSelfClosingElement(j, arg0.value));

      isDirty = true;
    }

    // createFactory(Route) ===> <Route />
    if (j.Identifier.check(arg0)) {
      path.replace(buildJsxSelfClosingElement(j, arg0.name));
      isDirty = true;
    }
  });

  if (isDirty) {
    removeUnusedSpecifiers(j, root, "react");
  }

  return isDirty ? root.toSource() : undefined;
}
