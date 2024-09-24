export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all CallExpressions
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "dragcontrols" },
        property: { name: "getRaycaster" },
      },
    })
    .forEach((path) => {
      // Replace with MemberExpression
      j(path).replaceWith(
        j.memberExpression(j.identifier("controls"), j.identifier("raycaster")),
      );
      dirtyFlag = true;
    });

  // Find all MemberExpressions with dragcontrols.getRaycaster()
  root
    .find(j.MemberExpression, {
      object: {
        type: "MemberExpression",
        property: { name: "dragcontrols" },
      },
      property: { name: "getRaycaster" },
    })
    .forEach((path) => {
      // Replace with MemberExpression
      j(path).replaceWith(
        j.memberExpression(
          j.memberExpression(path.node.object.object, j.identifier("controls")),
          j.identifier("raycaster"),
        ),
      );
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
