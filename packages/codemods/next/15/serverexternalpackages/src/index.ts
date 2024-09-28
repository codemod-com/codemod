export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the nextConfig object
  root.find(j.VariableDeclarator, { id: { name: 'nextConfig' } }).forEach(
    (path) => {
      const properties = path.node.init.properties;

      // Find the experimental property
      const experimentalProperty = properties.find(
        (prop) =>
        j.ObjectProperty.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === 'experimental',
      );

      if (
        experimentalProperty &&
        j.ObjectExpression.check(experimentalProperty.value)
      ) {
        const experimentalProperties =
          experimentalProperty.value.properties;

        // Find the serverComponentsExternalPackages property
        const serverComponentsExternalPackagesProperty =
          experimentalProperties.find(
            (prop) =>
            j.ObjectProperty.check(prop) &&
            j.Identifier.check(prop.key) &&
            prop.key.name ===
            'serverComponentsExternalPackages',
          );

        if (serverComponentsExternalPackagesProperty) {
          // Remove the serverComponentsExternalPackages property from experimental
          experimentalProperty.value.properties =
            experimentalProperties.filter(
              (prop) =>
              prop !==
              serverComponentsExternalPackagesProperty,
            );

          // Add the serverExternalPackages property to the root of nextConfig
          properties.push(
            j.property.from({
              kind: 'init',
              key: j.identifier('serverExternalPackages'),
              value: serverComponentsExternalPackagesProperty.value,
              shorthand: false,
            }),
          );

          dirtyFlag = true;
        }

        // Remove the experimental property if it's empty
        if (experimentalProperty.value.properties.length === 0) {
          path.node.init.properties = properties.filter(
            (prop) => prop !== experimentalProperty,
          );
        }
      }
    },
  );

  return dirtyFlag ? root.toSource() : undefined;
}