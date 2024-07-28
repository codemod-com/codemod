import type { API, FileInfo, Options } from "jscodeshift";

function transform(
  file: FileInfo,
  api: API,
  options: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all variable declarations
  root.find(j.VariableDeclaration).forEach((path) => {
    // Iterate over each declarator in the declaration
    path.node.declarations.forEach((declarator) => {
      // Check if the declarator is of type VariableDeclarator
      if (j.VariableDeclarator.check(declarator)) {
        // Check if the declarator id is an array pattern
        if (j.ArrayPattern.check(declarator.id)) {
          const elements = declarator.id.elements;

          // Ensure the array pattern has exactly two elements
          if (
            elements.length === 2 &&
            j.Identifier.check(elements[0]) &&
            j.Identifier.check(elements[1])
          ) {
            const sessionVar = elements[0].name;
            const loadingVar = elements[1].name;

            // Check if the initializer is a call expression to useSession
            if (
              declarator.init &&
              j.CallExpression.check(declarator.init) &&
              j.Identifier.check(declarator.init.callee) &&
              declarator.init.callee.name === "useSession"
            ) {
              // Replace the array destructuring with object destructuring
              declarator.id = j.objectPattern([
                j.property(
                  "init",
                  j.identifier("data"),
                  j.identifier(sessionVar),
                ),
                j.property(
                  "init",
                  j.identifier("status"),
                  j.identifier("status"),
                ),
              ]);

              // Add a new variable declaration for loading
              const loadingDeclaration = j.variableDeclaration("const", [
                j.variableDeclarator(
                  j.identifier(loadingVar),
                  j.binaryExpression(
                    "===",
                    j.identifier("status"),
                    j.literal("loading"),
                  ),
                ),
              ]);

              // Insert the new loading declaration after the current declaration
              j(path).insertAfter(loadingDeclaration);

              // Ensure the status property is not renamed
              declarator.id.properties.forEach((property) => {
                if (
                  j.Property.check(property) &&
                  j.Identifier.check(property.key) &&
                  property.key.name === "status"
                ) {
                  property.shorthand = true;
                }
              });
            }
          }
        }
      }
    });
  });

  return root.toSource(options);
}

export default transform;
