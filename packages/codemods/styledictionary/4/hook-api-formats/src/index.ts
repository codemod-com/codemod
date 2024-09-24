import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

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

  // Update import statements
  root.find(j.ImportDeclaration).forEach((path) => {
    const importSpecifiers = path.node.specifiers;

    importSpecifiers.forEach((specifier) => {
      if (specifier.imported && specifier.imported.name === "Formatter") {
        specifier.imported.name = "FormatFn";
      } else if (
        specifier.imported &&
        specifier.imported.name === "FormatterArguments"
      ) {
        specifier.imported.name = "FormatFnArguments";
      }
    });
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
