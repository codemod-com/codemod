export default function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ObjectExpression).forEach((path) => {
      path.node.properties.forEach((prop) => {
          if (prop.key.name === 'wsEngine') {
              // Get the current value of wsEngine
              const currentValue = prop.value.value || prop.value.name;

              // Replace the value with require(currentValue).Server
              prop.value = j.memberExpression(
                  j.callExpression(j.identifier('require'), [
                      j.literal(currentValue),
                  ]),
                  j.identifier('Server'),
              );
          }
      });
  });

  return root.toSource();
}