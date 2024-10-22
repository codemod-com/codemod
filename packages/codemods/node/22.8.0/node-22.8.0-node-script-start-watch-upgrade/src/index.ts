export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the "scripts" property in the JSON object
  root.find(j.Property, { key: { value: "scripts" } }).forEach(path => {
    const scriptsNode = path.value.value;

    // Ensure the "scripts" property is an object
    if (j.ObjectExpression.check(scriptsNode)) {
      // Find the "start" script property
      const startScript = scriptsNode.properties.find(prop =>
        j.Property.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === "start"
      );

      // Ensure the "start" script property exists and is a string literal
      if (startScript && j.Literal.check(startScript.value) && startScript.value.value === "node index.js") {
        // Update the "start" script value
        startScript.value.value = "node --watch index.js";
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}