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

  // List of properties to be moved into the `options` object
  const optionsProps = new Set([
    "className",
    "packageName",
    "type",
    "mapName",
    "name",
    "resourceType",
    "resourceMap",
  ]);

  // Function to transform an object expression by moving specific properties into an `options` object
  function moveToOptions(objectExpression) {
    const fileProps = objectExpression.properties;
    const optionsObject = j.objectExpression([]);

    objectExpression.properties = fileProps.filter((prop) => {
      if (optionsProps.has(prop.key.name)) {
        optionsObject.properties.push(prop);
        return false; // remove from the original properties
      }
      return true;
    });

    // Add `options` property if any options are found
    if (optionsObject.properties.length > 0) {
      objectExpression.properties.push(
        j.property("init", j.identifier("options"), optionsObject),
      );
    }
  }

  // Recursively search for object expressions and process them
  root.find(j.ObjectExpression).forEach((path) => {
    const obj = path.value;

    // Check if this object expression has the properties we care about
    const hasDestinationAndFormat = obj.properties.some((prop) => {
      if (prop.key.name === "files") {
        const filesArray = prop.value.elements;
        return filesArray.some((file) => {
          return (
            file.type === "ObjectExpression" &&
            file.properties.some((p) => p.key.name === "destination") &&
            file.properties.some((p) => p.key.name === "format")
          );
        });
      }
      return false;
    });

    // Only transform if destination and format are present
    if (hasDestinationAndFormat) {
      obj.properties.forEach((prop) => {
        if (prop.value.type === "ArrayExpression") {
          prop.value.elements.forEach((item) => {
            if (item.type === "ObjectExpression") {
              moveToOptions(item);
            }
          });
        }
      });
    }
  });

  return root.toSource();
}
