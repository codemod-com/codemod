export default function transform(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Rename `attributes` to `props`
  root
    .find(j.Identifier, { name: "attributes" })
    .replaceWith(j.identifier("props"));

  // Rename `nodeName` to `type`
  root
    .find(j.Identifier, { name: "nodeName" })
    .replaceWith(j.identifier("type"));

  // Move `children` inside `props` if it’s outside
  root.find(j.Property, { key: { name: "children" } }).forEach((path) => {
    const parent = path.parentPath.value;

    if (parent.type === "ObjectExpression" && parent.properties) {
      const propsProperty = parent.properties.find(
        (prop) => prop.key.name === "props",
      );

      if (propsProperty) {
        // Add children to props
        propsProperty.value.properties.push(
          j.property("init", j.identifier("children"), path.value.value),
        );
        // Remove original children property
        j(path).remove();
      } else {
        // If props does not exist, wrap children in a props object
        j(path).replaceWith(
          j.property(
            "init",
            j.identifier("props"),
            j.objectExpression([
              j.property("init", j.identifier("children"), path.value.value),
            ]),
          ),
        );
      }
    }
  });

  return root.toSource();
}
