import type { API, FileInfo } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  /**
   * @TODO make replaceImport util
   */

  root
    .find(j.ImportDeclaration, {
      source: { value: "react-test-renderer/shallow" },
    })
    .forEach((path) => {
      path.value.source.value = "react-shallow-renderer";
      isDirty = true;
    });

  root
    .find(j.CallExpression, {
      callee: {
        type: "Identifier",
        name: "require",
      },
    })
    .forEach((path) => {
      const firstArg = path.value.arguments.at(0);

      if (
        j.StringLiteral.check(firstArg) &&
        firstArg.value === "react-test-renderer/shallow"
      ) {
        firstArg.value = "react-shallow-renderer";
        isDirty = true;
      }
    });

  return isDirty ? root.toSource() : undefined;
}
