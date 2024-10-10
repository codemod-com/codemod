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
  let dirtyFlag = false;
  // Helper function to recursively find and transform format properties
  function transformObjectProperties(objectExpression) {
    const properties = objectExpression.properties;

    properties.forEach((prop, index) => {
      if (
        prop.key.name === "format" &&
        prop.value.type === "ObjectExpression"
      ) {
        // Create the hooks.formats property
        const hooksProp = j.property(
          "init",
          j.identifier("hooks"),
          j.objectExpression([
            j.property("init", j.identifier("formats"), prop.value),
          ]),
        );

        // Remove the old format property
        properties.splice(index, 1);

        // Add the new hooks property
        properties.push(hooksProp);

        // Transform the inner properties of the format object
        const formatProperties = prop.value.properties;
        formatProperties.forEach((formatProp) => {
          if (formatProp.key.name === "formatter") {
            formatProp.key.name = "format";
          }
        });
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

  // Update import types
  root.find(j.ImportDeclaration).forEach((path) => {
    if (
      j.Literal.check(path.node.source) &&
      path.node.source.value === "style-dictionary/types"
    ) {
      path.node.specifiers.forEach((specifier) => {
        if (j.ImportSpecifier.check(specifier)) {
          if (specifier.imported.name === "Formatter") {
            specifier.imported.name = "FormatFn";
            dirtyFlag = true;
          } else if (specifier.imported.name === "FormatterArguments") {
            specifier.imported.name = "FormatFnArguments";
            dirtyFlag = true;
          }
        }
      });
    }
  });

  // Update StyleDictionary.registerFormat calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "StyleDictionary" },
        property: { name: "registerFormat" },
      },
    })
    .forEach((path) => {
      const properties = path.node.arguments[0].properties;
      properties.forEach((prop) => {
        if (prop.key.name === "formatter") {
          prop.key.name = "format";
        }
      });
    });

  return root.toSource();
}
