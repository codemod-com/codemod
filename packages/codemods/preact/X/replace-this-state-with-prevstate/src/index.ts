export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all `this.setState` calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { type: "ThisExpression" },
        property: { name: "setState" },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;

      // Ensure the argument is an object expression
      if (args.length === 1 && j.ObjectExpression.check(args[0])) {
        const objectExpression = args[0];

        // Replace `this.state` with `prevState` inside the object expression
        j(objectExpression)
          .find(j.MemberExpression, {
            object: { type: "ThisExpression" },
            property: { name: "state" },
          })
          .replaceWith(() => j.identifier("prevState"));

        // Create the new arrow function expression
        const arrowFunction = j.arrowFunctionExpression(
          [j.identifier("prevState")],
          j.blockStatement([j.returnStatement(objectExpression)]),
        );

        // Replace the argument with the new arrow function
        path.node.arguments = [arrowFunction];
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
