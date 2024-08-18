import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  const newReturnValue = j.objectPattern([
    j.objectProperty(j.identifier("body"), j.identifier("body")),
    j.objectProperty(j.identifier("statusCode"), j.identifier("statusCode")),
    j.objectProperty(j.identifier("headers"), j.identifier("headers")),
    j.objectProperty(j.identifier("warnings"), j.identifier("warnings")),
  ]);

  // Transform Promise-based API usage
  root
    .find(j.AwaitExpression)
    .filter(
      (path) =>
        j.CallExpression.check(path.node.argument) &&
        j.MemberExpression.check(path.node.argument.callee) &&
        j.Identifier.check(path.node.argument.callee.property) &&
        path.node.argument.callee.property.name === "search",
    )
    .forEach((path) => {
      const parentNode = path.parent.node;
      if (
        j.VariableDeclarator.check(parentNode) &&
        j.Identifier.check(parentNode.id)
      ) {
        parentNode.id = newReturnValue;
        isDirty = true;
      }
    });

  // Transform Callback-based API usage
  root
    .find(j.CallExpression)
    .filter(
      (path) =>
        j.MemberExpression.check(path.node.callee) &&
        j.Identifier.check(path.node.callee.property) &&
        path.node.callee.property.name === "search" &&
        path.node.arguments.length === 2 &&
        (j.FunctionExpression.check(path.node.arguments[1]) ||
          j.ArrowFunctionExpression.check(path.node.arguments[1])),
    )
    .forEach((path) => {
      const callbackFunc = path.node.arguments[1];
      if (
        (j.FunctionExpression.check(callbackFunc) ||
          j.ArrowFunctionExpression.check(callbackFunc)) &&
        Array.isArray(callbackFunc.params) &&
        callbackFunc.params.length >= 2
      ) {
        const responseParam = callbackFunc.params[1];
        if (j.Identifier.check(responseParam)) {
          callbackFunc.params[1] = newReturnValue;
          callbackFunc.params.splice(2, 2);
          isDirty = true;
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
