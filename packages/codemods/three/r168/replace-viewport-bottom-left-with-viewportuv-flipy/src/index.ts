export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace instances of `viewportBottomLeft` with `viewportUV.flipY()`
  root.find(j.Identifier, { name: 'viewportBottomLeft' }).forEach(path => {
    const parent = path.parent.node;

    // Ensure the parent node is an appropriate type for replacement
    if (j.AssignmentExpression.check(parent) || j.VariableDeclarator.check(parent) || j.CallExpression.check(parent)) {
      j(path).replaceWith(
        j.callExpression(
          j.memberExpression(
            j.identifier('viewportUV'),
            j.identifier('flipY')
          ),
          []
        )
      );
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}