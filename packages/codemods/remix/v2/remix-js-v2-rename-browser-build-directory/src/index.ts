export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the module.exports object expression
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' }
    },
    right: { type: 'ObjectExpression' }
  }).forEach(path => {
    // Find the property with key 'browserBuildDirectory'
    path.value.right.properties.forEach(property => {
      if (j.ObjectProperty.check(property) && j.Identifier.check(property.key) && property.key.name === 'browserBuildDirectory') {
        property.key.name = 'assetsBuildDirectory';
        dirtyFlag = true;
      }
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
}