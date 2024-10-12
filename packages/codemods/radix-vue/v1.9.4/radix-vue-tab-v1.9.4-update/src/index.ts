export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all `watch` function calls
  root.find(j.CallExpression, { callee: { name: 'watch' } }).forEach(path => {
    const args = path.value.arguments;

    // Ensure the first argument is an arrow function
    if (j.ArrowFunctionExpression.check(args[0])) {
      const firstArg = args[0];

      // Ensure the body of the arrow function is a single expression
      if (j.BlockStatement.check(firstArg.body) === false) {
        const newBody = j.arrayExpression([
          firstArg.body,
          j.memberExpression(
            j.optionalMemberExpression(j.identifier('context'), j.identifier('dir'), false, true),
            j.identifier('value')
          )
        ]);
        firstArg.body = newBody;
        dirtyFlag = true;
      }
    }

    // Ensure the second argument is an arrow function
    if (j.ArrowFunctionExpression.check(args[1])) {
      const secondArg = args[1];

      // Remove the parameter `n` from the second argument
      if (secondArg.params.length > 0) {
        secondArg.params = [];
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}