export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  root
    .find(j.AssignmentExpression, {
      left: { object: { name: "module" }, property: { name: "exports" } },
    })
    .forEach((path) => {
      const outputProperty = path
        .get("right", "properties")
        .filter((prop) => prop.node.key.name === "output")[0];
      if (!outputProperty) return;

      const outputObject = outputProperty.get("value");
      const libraryProperty = outputObject
        .get("properties")
        .filter((prop) => prop.node.key.name === "library")[0];
      const libraryTargetProperty = outputObject
        .get("properties")
        .filter((prop) => prop.node.key.name === "libraryTarget")[0];

      if (!libraryProperty) return;

      const libraryName = libraryProperty.node.value.value;
      const libraryType = libraryTargetProperty
        ? libraryTargetProperty.node.value.value
        : undefined;

      // Replace library property with trailing commas
      libraryProperty.replace(
        j.property.from({
          kind: "init",
          key: j.identifier("library"),
          value: j.objectExpression(
            [
              j.property.from({
                kind: "init",
                key: j.identifier("name"),
                value: j.literal(libraryName),
              }),
              j.property.from({
                kind: "init",
                key: j.identifier("type"),
                value: libraryType
                  ? j.literal(libraryType)
                  : j.identifier("undefined"),
              }),
            ],
            true,
          ),
        }),
      );

      // Remove libraryTarget property if it exists
      if (libraryTargetProperty) {
        j(libraryTargetProperty).remove();
      }

      dirtyFlag = true;
    });

  return dirtyFlag
    ? root.toSource({ quote: "single", trailingComma: "all" })
    : undefined;
}
