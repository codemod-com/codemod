import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Traverse the JSON object
  root.find(j.ObjectExpression).forEach((path) => {
    path.node.properties.forEach((property) => {
      if (property.key.name === "log" && j.Literal.check(property.value)) {
        // Convert the old `log` format to the new object format
        const logValue = property.value.value;
        const newLogObject = j.objectExpression([
          j.property("init", j.identifier("warnings"), j.literal(logValue)),
          j.property("init", j.identifier("verbosity"), j.literal("default")),
        ]);

        property.value = newLogObject; // Replace the value
      }
    });
  });

  return root.toSource();
}
