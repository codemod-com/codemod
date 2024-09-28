export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace all instances of `viewportTopLeft` with `viewportUV`
  root.find(j.Identifier, { name: "viewportTopLeft" }).replaceWith((path) => {
    dirtyFlag = true;
    return j.identifier("viewportUV");
  });

  // Update the import statement if necessary
  root.find(j.ImportDeclaration).forEach((path) => {
    const specifiers = path.node.specifiers;
    let importChanged = false;

    specifiers.forEach((specifier) => {
      if (
        j.ImportSpecifier.check(specifier) &&
        specifier.imported.name === "viewportTopLeft"
      ) {
        specifier.imported = j.identifier("viewportUV");
        importChanged = true;
      }
    });

    if (importChanged) {
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
