import type { API, FileInfo } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all CallExpressions
  root.find(j.CallExpression).forEach((path) => {
    // Ensure the callee is a MemberExpression
    if (path.node.callee.type === "MemberExpression") {
      const memberExpression = path.node.callee;
      // Ensure the object is an Identifier named 'client'
      if (memberExpression.object.type === "Identifier") {
        // Ensure the property is an Identifier named 'disableBuildhook'
        if (
          memberExpression.property.type === "Identifier" &&
          memberExpression.property.name === "enableBuildhook"
        ) {
          // Replace 'disableBuildhook' with 'disableBuildEventHandlers'
          memberExpression.property.name = "enableBuildEventHandlers";
        }
      }
    }
  });

  return root.toSource();
}
