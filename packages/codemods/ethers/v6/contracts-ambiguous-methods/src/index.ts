export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all call expressions
  root.find(j.CallExpression).forEach((path) => {
    const { callee, arguments: args } = path.node;

    // Check if the callee is a member expression and the object is 'contract' and property is 'foo'
    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === "contract" &&
      j.Identifier.check(callee.property) &&
      callee.property.name === "foo"
    ) {
      // Wrap the first argument with Typed.address
      if (args.length > 0) {
        path.node.arguments[0] = j.callExpression(
          j.memberExpression(j.identifier("Typed"), j.identifier("address")),
          [args[0]],
        );
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
