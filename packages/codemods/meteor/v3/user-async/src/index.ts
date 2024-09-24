export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to mark the closest function as async
  function markClosestFunctionAsAsync(path) {
    const closestFunction = j(path).closestScope().filter(p =>
      j.FunctionDeclaration.check(p.node) ||
      j.FunctionExpression.check(p.node) ||
      j.ArrowFunctionExpression.check(p.node)
    );

    if (closestFunction.length > 0 && !closestFunction.get(0).node.async) {
      closestFunction.get(0).node.async = true;
      dirtyFlag = true;
    }
  }

  // Find all instances of Meteor.user() and replace them with await Meteor.userAsync()
  root.find(j.CallExpression, {
    callee: {
      object: { name: 'Meteor' },
      property: { name: 'user' }
    }
  }).forEach(path => {
    const newCallExpression = j.awaitExpression(
      j.callExpression(
        j.memberExpression(j.identifier('Meteor'), j.identifier('userAsync')),
        []
      )
    );

    j(path).replaceWith(newCallExpression);
    markClosestFunctionAsAsync(path);
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}