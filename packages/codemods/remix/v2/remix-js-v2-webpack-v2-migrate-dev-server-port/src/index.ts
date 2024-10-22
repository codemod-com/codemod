export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the module.exports assignment
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' }
    }
  }).forEach(path => {
    const properties = path.node.right.properties;
    const devServerPortProp = properties.find(prop => prop.key.name === 'devServerPort');

    if (devServerPortProp) {
      // Remove the devServerPort property from the root object
      properties.splice(properties.indexOf(devServerPortProp), 1);

      // Create the new nested structure
      const futureObject = j.objectExpression([
        j.property.from({
          kind: 'init',
          key: j.identifier('v2_dev'),
          value: j.objectExpression([
            j.property.from({
              kind: 'init',
              key: j.identifier('port'),
              value: devServerPortProp.value
            })
          ])
        })
      ]);

      // Add the future object
      properties.push(j.property.from({
        kind: 'init',
        key: j.identifier('future'),
        value: futureObject
      }));

      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource({ quote: 'single', trailingComma: true }) : undefined;
}