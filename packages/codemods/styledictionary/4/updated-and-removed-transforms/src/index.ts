import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

const transformations = {
  "name/cti/": "name/",
  "font/objC/literal": null,
  "font/swift/literal": null,
  "font/flutter/literal": null,
  "content/icon": "html/icon",
};

function transformTransforms(transforms) {
  return transforms
    .map((transform) => {
      // Replace 'name/cti/<thing>' with 'name/<thing>'
      for (const [oldPrefix, newPrefix] of Object.entries(transformations)) {
        if (transform.startsWith(oldPrefix)) {
          return newPrefix ? transform.replace(oldPrefix, newPrefix) : null;
        }
      }
      return transform;
    })
    .filter((transform) => transform !== null); // Remove null values
}

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ObjectExpression).forEach((path) => {
    const obj = path.node;

    // Find the transforms array within the config
    const transformsNode = obj.properties.find(
      (prop) => prop.key.name === "transforms",
    );

    if (transformsNode && transformsNode.value.type === "ArrayExpression") {
      const transformsArray = transformsNode.value.elements;
      const transforms = transformsArray.map((elem) => elem.value);
      const transformed = transformTransforms(transforms);

      // Update the array with transformed values
      transformsNode.value.elements = transformed.map((value) =>
        j.literal(value),
      );
    }
  });

  return root.toSource({ quote: "single" });
}
