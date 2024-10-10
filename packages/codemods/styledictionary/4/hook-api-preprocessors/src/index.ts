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
  root.find(j.ObjectExpression).forEach((path) => {
    const properties = path.node.properties;

    const preprocessorPropIndex = properties.findIndex(
      (prop) =>
        prop.key.name === "preprocessors" &&
        prop.value.type === "ObjectExpression",
    );

    if (preprocessorPropIndex !== -1) {
      const preprocessorProp = properties[preprocessorPropIndex];
      const preprocessorValue = preprocessorProp.value;

      // Create the hooks.preprocessors property
      const hooksProp = j.property(
        "init",
        j.identifier("hooks"),
        j.objectExpression([
          j.property("init", j.identifier("preprocessors"), preprocessorValue),
        ]),
      );

      // Remove the old preprocessors property
      properties.splice(preprocessorPropIndex, 1);

      // Add the new hooks property
      properties.push(hooksProp);

      // Create the global preprocessors property with string literals
      const globalPreprocessorsProp = j.property(
        "init",
        j.identifier("preprocessors"),
        j.arrayExpression(
          preprocessorValue.properties.map((prop) => j.literal(prop.key.name)),
        ),
      );

      // Add the global preprocessors property if not already present
      if (
        !properties.some(
          (prop) => prop.key.name === "preprocessors" && prop !== hooksProp,
        )
      ) {
        properties.push(globalPreprocessorsProp);
      }
    }
  });

  return root.toSource();
}
