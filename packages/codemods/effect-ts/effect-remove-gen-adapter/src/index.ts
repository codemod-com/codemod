import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  function replaceWithComments(path, newNode) {
    // If the original node had comments, add them to the new node
    if (path.node.comments) {
      newNode.comments = path.node.comments;
    }

    // Replace the node
    j(path).replaceWith(newNode);
  }

  // Find all CallExpression nodes
  root.find(j.CallExpression).forEach((path) => {
    // Check if the function is called 'gen'
    if (path.node.callee.property && path.node.callee.property.name === "gen") {
      // Check if the argument is a generator function with a single parameter
      const func = path.node.arguments[0];
      if (
        func.type === "FunctionExpression" &&
        func.generator &&
        func.params.length === 1
      ) {
        // Get the name of the parameter
        const paramName = func.params[0].name;

        // Remove the parameter
        func.params = [];

        // Find all Identifier nodes within the function
        j(func)
          .find(j.Identifier)
          .forEach((innerPath) => {
            // Check if the identifier has the same name as the parameter
            if (innerPath.node.name === paramName) {
              // Remove the identifier
              replaceWithComments(innerPath, j.identifier(""));
            }
          });
      }
    }
  });

  return root.toSource();
}
