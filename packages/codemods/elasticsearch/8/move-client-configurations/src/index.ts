import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

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

  // List of client-related configuration parameters to move to the second options object
  const clientConfigKeys = [
    "ignore",
    "headers",
    "requestTimeout",
    "maxRetries",
  ];

  // Transform for promise-based and callback-based usage
  root
    .find(j.CallExpression)
    .filter((path) => isClientCall(path.node.callee))
    .forEach((path) => {
      const args = path.node.arguments;
      const apiObject = args[0];
      let clientOptionsObject: any;

      if (j.ObjectExpression.check(apiObject)) {
        // Find the properties that need to be moved
        const configProperties = apiObject.properties.filter(
          (prop) =>
            j.ObjectProperty.check(prop) &&
            j.Identifier.check(prop.key) &&
            clientConfigKeys.includes(prop.key.name),
        );

        if (configProperties.length > 0) {
          // Remove config properties from the API object
          apiObject.properties = apiObject.properties.filter(
            (prop) => !configProperties.includes(prop),
          );

          // If a second argument (options) exists, add the config properties to it
          if (args.length >= 2 && j.ObjectExpression.check(args[1])) {
            clientOptionsObject = args[1];
            clientOptionsObject.properties.push(...configProperties);
          } else {
            // Otherwise, create a new options object and add it as the second argument
            clientOptionsObject = j.objectExpression(configProperties);
            args.push(clientOptionsObject);
          }

          isDirty = true;
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
