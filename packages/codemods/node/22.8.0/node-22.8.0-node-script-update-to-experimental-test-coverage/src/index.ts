export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the "scripts" property in the JSON object
  root.find(j.Property, { key: { value: "scripts" } }).forEach(path => {
    const scriptsNode = path.value.value;

    // Ensure the "scripts" property is an object
    if (j.ObjectExpression.check(scriptsNode)) {
      // Find the "start" script
      scriptsNode.properties.forEach(script => {
        if (j.Property.check(script) && script.key.value === "start") {
          const startScriptValue = script.value.value;

          // Ensure the "start" script is a string and contains "node server.js"
          if (typeof startScriptValue === 'string' && startScriptValue === "node server.js") {
            // Update the "start" script
            script.value = j.literal("node --experimental-test-coverage server.js");
            dirtyFlag = true;
          }
        }
      });
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}