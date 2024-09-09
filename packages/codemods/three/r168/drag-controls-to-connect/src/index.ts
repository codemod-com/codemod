export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace `dragControls.activate()` with `connect()`
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      property: { name: 'activate' }
    }
  }).forEach(path => {
    const { object } = path.node.callee;
    if (j.Identifier.check(object) && object.name === 'dragControls') {
      j(path).replaceWith(j.callExpression(j.identifier('connect'), []));
      dirtyFlag = true;
    } else if (j.MemberExpression.check(object) && object.property.name === 'dragControls') {
      j(path).replaceWith(j.callExpression(j.memberExpression(object.object, j.identifier('connect')), []));
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}