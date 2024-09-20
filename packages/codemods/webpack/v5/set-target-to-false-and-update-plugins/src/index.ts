export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the module.exports assignment
  root.find(j.AssignmentExpression, {
    left: {
      type: 'MemberExpression',
      object: { name: 'module' },
      property: { name: 'exports' },
    },
  }).forEach((path) => {
    const right = path.node.right;

    // Ensure the right-hand side is an object expression
    if (j.ObjectExpression.check(right)) {
      const properties = right.properties;
      let targetIndex = -1;
      let targetValue = null;

      // Find the target property
      properties.forEach((prop, index) => {
        if (
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === 'target'
        ) {
          if (j.CallExpression.check(prop.value)) {
            targetIndex = index;
            targetValue = prop.value;
          }
        }
      });

      if (targetIndex !== -1 && targetValue !== null) {
        // Replace target property value with false
        properties[targetIndex].value = j.booleanLiteral(false);

        // Insert plugins property after target property
        properties.splice(
          targetIndex + 1,
          0,
          j.objectProperty(
            j.identifier('plugins'),
            j.arrayExpression([targetValue]),
          ),
        );

        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource({ trailingComma: true }) : undefined;
}