export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all CallExpressions
  root
    .find(j.CallExpression, { callee: { property: { name: "getRaycaster" } } })
    .forEach((path) => {
      if (
        j.MemberExpression.check(path.node.callee.object) &&
        path.node.callee.object.property.name === "dragcontrols"
      ) {
        path.node.callee.object.property.name = "controls";
      }

      if (
        j.Identifier.check(path.node.callee.object) &&
        path.node.callee.object.name === "dragcontrols"
      ) {
        path.node.callee.object.name = "controls";
      }

      path.node.callee.property.name = "raycaster";
      j(path).replaceWith(path.node.callee);
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
