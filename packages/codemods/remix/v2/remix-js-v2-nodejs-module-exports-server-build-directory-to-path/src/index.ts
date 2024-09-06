export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the module.exports object expression
  root.find(j.AssignmentExpression, {
    left: {
      type: 'MemberExpression',
      object: { name: 'module' },
      property: { name: 'exports' }
    },
    right: { type: 'ObjectExpression' }
  }).forEach(path => {
    const properties = path.node.right.properties;

    // Find the serverBuildDirectory property
    properties.forEach((property, index) => {
      if (j.ObjectProperty.check(property) && j.Identifier.check(property.key) && property.key.name === 'serverBuildDirectory') {
        // Replace the property key and update the value
        property.key.name = 'serverBuildPath';
        if (j.StringLiteral.check(property.value) && typeof property.value.value === 'string') {
          property.value.value = `${property.value.value}/index.js`;
        }
        dirtyFlag = true;
      }
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
}