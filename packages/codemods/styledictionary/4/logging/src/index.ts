export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

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

  // Find all variable declarators with an object expression
  root
    .find(j.VariableDeclarator, {
      init: { type: "ObjectExpression" },
    })
    .forEach((path) => {
      const configObject = path.node.init;

      // Find the `log` property within the object
      const logProperty = configObject.properties.find(
        (prop) =>
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === "log",
      );

      if (logProperty && j.ObjectExpression.check(logProperty.value)) {
        const logObject = logProperty.value;

        // Check if `verbosity` property already exists
        const verbosityExists = logObject.properties.some(
          (prop) =>
            j.ObjectProperty.check(prop) &&
            j.Identifier.check(prop.key) &&
            prop.key.name === "verbosity",
        );

        // If `verbosity` does not exist, add it
        if (!verbosityExists) {
          logObject.properties.push(
            j.objectProperty(
              j.identifier("verbosity"),
              j.stringLiteral("verbose"),
            ),
          );
          dirtyFlag = true;
        }
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = "tsx";
