import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Check if the file imports from or references 'style-dictionary'
  const hasStyleDictionaryReference =
    root
      .find(j.ImportDeclaration)
      .some((path) => path.node.source.value.includes("style-dictionary")) ||
    root
      .find(j.VariableDeclaration)
      .filter((path) => {
        return path.node.declarations.some((declaration) => {
          return (
            declaration.init &&
            declaration.init.type === "CallExpression" &&
            declaration.init.callee.name === "require" &&
            declaration.init.arguments[0].value.includes("style-dictionary")
          );
        });
      })
      .size() > 0;

  if (!hasStyleDictionaryReference) {
    // If there's no reference to 'style-dictionary', do not process the file
    return;
  }

  // Helper function to recursively find and transform transformGroup properties
  function transformObjectProperties(objectExpression) {
    const properties = objectExpression.properties;

    properties.forEach((prop, index) => {
      if (
        prop.key.name === "transformGroup" &&
        prop.value.type === "ObjectExpression"
      ) {
        // Create the hooks.transformGroups property
        const hooksProp = j.property(
          "init",
          j.identifier("hooks"),
          j.objectExpression([
            j.property("init", j.identifier("transformGroups"), prop.value),
          ]),
        );

        // Remove the old transformGroup property
        properties.splice(index, 1);

        // Add the new hooks property
        properties.push(hooksProp);
      } else if (prop.value.type === "ObjectExpression") {
        // Recursively transform nested objects
        transformObjectProperties(prop.value);
      }
    });
  }

  // Find all object expressions in the file and transform them
  root.find(j.ObjectExpression).forEach((path) => {
    transformObjectProperties(path.node);
  });

  return root.toSource();
}
