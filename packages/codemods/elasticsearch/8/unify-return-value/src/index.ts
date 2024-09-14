import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  function returnUnifiedObject(varName: string) {
    return j.objectPattern([
      j.objectProperty(j.identifier("body"), j.identifier(varName)),
      j.objectProperty(j.identifier("statusCode"), j.identifier("statusCode")),
      j.objectProperty(j.identifier("headers"), j.identifier("headers")),
      j.objectProperty(j.identifier("warnings"), j.identifier("warnings")),
      j.objectProperty(j.identifier("meta"), j.identifier("meta")),
    ]);
  }

  // Helper function to check if the expression starts with `client.`
  function isClientCall(node: any): boolean {
    let currentNode = node;
    while (j.MemberExpression.check(currentNode)) {
      if (
        j.Identifier.check(currentNode.object) &&
        currentNode.object.name === "client"
      ) {
        return true;
      }
      currentNode = currentNode.object;
    }
    return false;
  }

  // Transform Promise-based API usage for any `client.` method
  root
    .find(j.AwaitExpression)
    .filter(
      (path) =>
        j.CallExpression.check(path.node.argument) &&
        isClientCall(path.node.argument.callee),
    )
    .forEach((path) => {
      const parentNode = path.parent.node;
      if (
        j.VariableDeclarator.check(parentNode) &&
        j.ObjectPattern.check(parentNode.id) === false &&
        j.Identifier.check(parentNode.id)
      ) {
        const varName = parentNode.id.name;
        parentNode.id = returnUnifiedObject(varName);
        isDirty = true;
      }
    });

  // Transform Callback-based API usage for any `client.` method
  root
    .find(j.CallExpression)
    .filter(
      (path) =>
        isClientCall(path.node.callee) &&
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
          const varName = responseParam.name;
          callbackFunc.params[1] = returnUnifiedObject(varName);
          callbackFunc.params.splice(2, 2); // Remove extra parameters if they exist
          isDirty = true;
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
