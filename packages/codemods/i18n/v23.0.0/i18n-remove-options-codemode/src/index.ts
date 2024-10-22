export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the variable declaration for `options`
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.node.declarations[0];
    if (
      j.Identifier.check(declaration.id) &&
      declaration.id.name === 'options'
    ) {
      // Remove the variable declaration
      j(path).remove();
      dirtyFlag = true;
    }
  });

  // Find the i18n.init call and remove the `options` property
  root.find(j.CallExpression, {
    callee: { object: { name: 'i18n' }, property: { name: 'init' } },
  }).forEach((path) => {
    const args = path.node.arguments;
    if (args.length > 0 && j.ObjectExpression.check(args[0])) {
      const properties = args[0].properties;
      const newProperties = properties.filter((prop) => {
        if (
          j.Property.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === 'options'
        ) {
          dirtyFlag = true;
          return false;
        }
        return true;
      });
      args[0].properties = newProperties;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}