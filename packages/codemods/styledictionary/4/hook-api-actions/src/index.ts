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

  // Find and update `action` to `hooks.actions`
  root.find(j.ObjectExpression).forEach((path) => {
    const obj = path.node;

    // Check if `action` property exists
    const actionProp = obj.properties.find(
      (prop) =>
        prop.key.name === "action" ||
        (prop.key.type === "Literal" && prop.key.value === "action"),
    );

    if (actionProp) {
      // Create `hooks` property if it doesn't exist
      let hooksProp = obj.properties.find(
        (prop) =>
          prop.key.name === "hooks" ||
          (prop.key.type === "Literal" && prop.key.value === "hooks"),
      );

      if (!hooksProp) {
        hooksProp = j.property(
          "init",
          j.identifier("hooks"),
          j.objectExpression([]),
        );
        obj.properties.push(hooksProp);
      }

      const hooksObj = hooksProp.value;
      const actionsProp = hooksObj.properties.find(
        (prop) =>
          prop.key.name === "actions" ||
          (prop.key.type === "Literal" && prop.key.value === "actions"),
      );

      if (!actionsProp) {
        // Create `actions` inside `hooks`
        const newActionsProp = j.property(
          "init",
          j.identifier("actions"),
          j.objectExpression([]),
        );
        hooksObj.properties.push(newActionsProp);
      }

      // Move `action` properties to `hooks.actions`
      const actionsObj = hooksObj.properties.find(
        (prop) =>
          prop.key.name === "actions" ||
          (prop.key.type === "Literal" && prop.key.value === "actions"),
      );

      actionsObj.value.properties.push(...actionProp.value.properties);
      obj.properties = obj.properties.filter((prop) => prop !== actionProp);
    }
  });

  return root.toSource({ quote: "single" });
}
