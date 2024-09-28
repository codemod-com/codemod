export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to transform synchronous calls to asynchronous
  function transformToAsync(path, methodName) {
    const callee = path.node.callee;
    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.property) &&
      callee.property.name === methodName
    ) {
      callee.property.name = `${methodName}Async`;
      path.replace(j.awaitExpression(path.node));
      dirtyFlag = true;
    }
  }

  // Transform function declarations to async if they contain transformed calls
  root.find(j.FunctionDeclaration).forEach((path) => {
    const body = path.node.body;
    let containsTransformedCall = false;

    j(body)
      .find(j.CallExpression)
      .forEach((callPath) => {
        const callee = callPath.node.callee;
        if (
          j.MemberExpression.check(callee) &&
          j.Identifier.check(callee.property)
        ) {
          const methodName = callee.property.name;
          if (
            methodName === "setPassword" ||
            methodName === "getText" ||
            methodName === "getBinary"
          ) {
            transformToAsync(callPath, methodName);
            containsTransformedCall = true;
          }
        }
      });

    if (containsTransformedCall) {
      path.node.async = true;
      dirtyFlag = true;
    }
  });

  // Transform standalone method calls
  root.find(j.ExpressionStatement).forEach((path) => {
    const expression = path.node.expression;
    if (j.CallExpression.check(expression)) {
      const callee = expression.callee;
      if (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.property)
      ) {
        const methodName = callee.property.name;
        if (methodName === "addEmail") {
          callee.property.name = `${methodName}Async`;
          path.replace(j.expressionStatement(j.awaitExpression(expression)));
          dirtyFlag = true;
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
