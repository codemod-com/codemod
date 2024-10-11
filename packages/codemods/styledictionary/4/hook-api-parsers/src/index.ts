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

  // Function to transform parsers array to hooks.parsers object
  function transformParsersArray(path) {
    // Check if `parsers` is an array property
    const parsersProperty = path.value.properties.find(
      (prop) =>
        prop.key.name === "parsers" && j.ArrayExpression.check(prop.value),
    );

    if (parsersProperty) {
      const parserConfigs = parsersProperty.value.elements; // Get all parser objects
      const parserPropertiesMap = new Map();

      // Iterate over all parser configs
      parserConfigs.forEach((parserConfig) => {
        const parserProperties = parserConfig.properties;

        // Rename 'parse' property to 'parser'
        parserProperties.forEach((prop) => {
          if (prop.key.name === "parse") {
            prop.key.name = "parser"; // Rename parse to parser
          }
        });

        // Generate the parser name based on the file extension in the pattern regex
        const patternProperty = parserProperties.find(
          (p) => p.key.name === "pattern",
        );
        const patternRegex = patternProperty.value.regex.pattern; // e.g., /\.yaml$/ -> "yaml"
        const extensionMatch = patternRegex.match(/\\\.([a-z0-9]+)\$/);
        const parserName = extensionMatch
          ? `${extensionMatch[1]}-parser`
          : "custom-parser";

        // Store the parser configuration in a map with parserName as the key
        parserPropertiesMap.set(parserName, parserProperties);
      });

      // Create the new `hooks.parsers` object with all parser configurations
      const hooksProperty = j.property(
        "init",
        j.identifier("hooks"),
        j.objectExpression([
          j.property(
            "init",
            j.identifier("parsers"),
            j.objectExpression(
              Array.from(parserPropertiesMap.entries()).map(
                ([parserName, properties]) =>
                  j.property(
                    "init",
                    j.literal(parserName),
                    j.objectExpression([...properties]), // Move all properties inside
                  ),
              ),
            ),
          ),
        ]),
      );

      // Replace `parsers` property with `parsers: [parserNames]`
      parsersProperty.value = j.arrayExpression(
        Array.from(parserPropertiesMap.keys()).map((parserName) =>
          j.literal(parserName),
        ),
      );

      // Add the `hooks` property to the root object
      path.value.properties.push(hooksProperty);
    }
  }

  // Function to transform StyleDictionary.registerParser calls
  function transformRegisterParserCalls(path) {
    const args = path.node.arguments;

    // Ensure the first argument is an object expression
    if (args.length > 0 && args[0].type === "ObjectExpression") {
      const properties = args[0].properties;

      // Check if 'name' property already exists
      const hasNameProperty = properties.some(
        (prop) => prop.key.name === "name",
      );

      // If 'name' property does not exist, add it
      if (!hasNameProperty) {
        properties.unshift(
          j.property("init", j.identifier("name"), j.literal("parser-foo")),
        );
      }

      // Find and rename 'parse' property to 'parser'
      properties.forEach((prop) => {
        if (prop.key.name === "parse") {
          prop.key.name = "parser"; // Rename parse to parser
        }
      });
    }
  }

  // Apply the transformation for parsers array to hooks.parsers object
  root.find(j.ObjectExpression).forEach(transformParsersArray);

  // Apply the transformation for StyleDictionary.registerParser calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "StyleDictionary" },
        property: { name: "registerParser" },
      },
    })
    .forEach(transformRegisterParserCalls);

  return root.toSource();
}
