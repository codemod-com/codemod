import type { API, FileInfo, JSCodeshift } from "jscodeshift";

import { getClassComponents } from "@codemod.com/codemod-utils";

const buildCallbackRef = (j: JSCodeshift, refName: string) =>
  j.jsxAttribute(
    j.jsxIdentifier("ref"),
    j.jsxExpressionContainer(
      j.arrowFunctionExpression(
        [j.jsxIdentifier("ref")],
        j.blockStatement([
          j.expressionStatement(
            j.assignmentExpression(
              "=",
              j.memberExpression(
                j.memberExpression(j.thisExpression(), j.identifier("refs")),
                j.identifier(refName),
              ),
              j.identifier("ref"),
            ),
          ),
        ]),
      ),
    ),
  );

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  getClassComponents(j, root)?.forEach((path) => {
    j(path)
      .find(j.JSXAttribute, {
        name: {
          type: "JSXIdentifier",
          name: "ref",
        },
      })
      .forEach((path) => {
        const attributeValue = path.value.value;
        if (!j.StringLiteral.check(attributeValue)) {
          return;
        }

        isDirty = true;

        path.replace(buildCallbackRef(j, attributeValue.value));
      });
  });

  return isDirty ? root.toSource() : undefined;
}
