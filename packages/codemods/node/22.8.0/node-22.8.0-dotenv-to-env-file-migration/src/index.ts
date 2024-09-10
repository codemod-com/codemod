export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Remove "dotenv" dependency from "dependencies"
  root.find(j.Property, { key: { value: "dependencies" } })
    .forEach(path => {
      if (j.ObjectExpression.check(path.value.value)) {
        path.value.value.properties = path.value.value.properties.filter(prop => {
          if (j.Property.check(prop) && j.Literal.check(prop.key) && prop.key.value === "dotenv") {
            dirtyFlag = true;
            return false;
          }
          return true;
        });
      }
    });

  // Update the "start" script in the "scripts" section
  root.find(j.Property, { key: { value: "scripts" } })
    .forEach(path => {
      if (j.ObjectExpression.check(path.value.value)) {
        path.value.value.properties.forEach(prop => {
          if (j.Property.check(prop) && j.Literal.check(prop.key) && prop.key.value === "start") {
            if (j.Literal.check(prop.value) && prop.value.value === "node -r dotenv/config index.js") {
              prop.value.value = "node --env-file=.env index.js";
              dirtyFlag = true;
            }
          }
        });
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}