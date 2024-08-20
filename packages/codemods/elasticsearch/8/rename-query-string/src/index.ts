import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  // Helper function to check if the expression is `client.transport.request`
  function isTransportRequestCall(node: any): boolean {
    return (
      j.MemberExpression.check(node.callee) &&
      j.MemberExpression.check(node.callee.object) &&
      j.Identifier.check(node.callee.object.property) &&
      j.Identifier.check(node.callee.object.object) &&
      j.Identifier.check(node.callee.property) &&
      node.callee.object.property.name === "transport" &&
      node.callee.object.object.name === "client" &&
      node.callee.property.name === "request"
    );
  }

  // Transform for promise-based and callback-based usage
  root
    .find(j.CallExpression)
    .filter((path) => isTransportRequestCall(path.node))
    .forEach((path) => {
      const args = path.node.arguments;
      const apiObject = args[0];

      if (j.ObjectExpression.check(apiObject)) {
        // Find and replace `query` with `querystring`
        const queryProperty = apiObject.properties.find(
          (prop) =>
            j.ObjectProperty.check(prop) &&
            j.Identifier.check(prop.key) &&
            prop.key.name === "query",
        );
        if (queryProperty) {
          queryProperty.key.name = "querystring";
          isDirty = true;
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
