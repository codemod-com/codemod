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
  // Helper function to recursively find and transform object properties
  function transformObjectProperties(objectExpression) {
    const properties = objectExpression.properties;

    properties.forEach((prop, index) => {
      if (
        prop.key.name === "transform" &&
        prop.value.type === "ObjectExpression"
      ) {
        // Create the hooks.transforms property
        const hooksProp = j.property(
          "init",
          j.identifier("hooks"),
          j.objectExpression([
            j.property("init", j.identifier("transforms"), prop.value),
          ]),
        );

        // Remove the old transform property
        properties.splice(index, 1);

        // Add the new hooks property
        properties.push(hooksProp);

        // Transform the inner properties of the transform object
        const transformProperties = prop.value.properties;
        transformProperties.forEach((transformProp) => {
          if (transformProp.value.type === "ObjectExpression") {
            const innerProperties = transformProp.value.properties;
            innerProperties.forEach((innerProp) => {
              if (innerProp.key.name === "matcher") {
                innerProp.key.name = "filter";
              } else if (innerProp.key.name === "transformer") {
                innerProp.key.name = "transform";
              }
            });
          }
        });
      } else if (prop.value.type === "ObjectExpression") {
        // Recursively transform nested objects
        transformObjectProperties(prop.value);
      }
    });
  }

  // Transform object properties in all object expressions
  root.find(j.ObjectExpression).forEach((path) => {
    transformObjectProperties(path.node);
  });

  // Handle StyleDictionary.registerTransform calls
  root.find(j.CallExpression).forEach((path) => {
    const callee = path.node.callee;
    if (
      callee.object &&
      callee.object.name === "StyleDictionary" &&
      callee.property.name === "registerTransform"
    ) {
      path.node.arguments.forEach((arg) => {
        if (arg.type === "ObjectExpression") {
          arg.properties.forEach((prop) => {
            // Rename 'matcher' to 'filter'
            if (prop.key.name === "matcher") {
              prop.key.name = "filter";
            }

            // Rename 'transformer' to 'transform'
            if (prop.key.name === "transformer") {
              prop.key.name = "transform";
            }
          });
        }
      });
    }
  });

  return root.toSource();
}
