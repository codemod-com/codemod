export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace taScene.dragControls.deactivate() with taScene.disconnect()
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      property: { name: 'deactivate' }
    }
  }).forEach(path => {
    const memberExpr = path.node.callee;
    if (j.MemberExpression.check(memberExpr)) {
      const object = memberExpr.object;
      if (j.MemberExpression.check(object)) {
        path.replace(j.callExpression(j.memberExpression(object.object, j.identifier('disconnect')), []));
        dirtyFlag = true;
      }
    }
  });

  // Replace dragControls.deactivate() with disconnect()
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'dragControls' },
      property: { name: 'deactivate' }
    }
  }).forEach(path => {
    path.replace(j.callExpression(j.identifier('disconnect'), []));
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}