export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Remove the import statement for Future from 'fibers/future'
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.node.declarations[0];
    if (
      j.CallExpression.check(declaration.init) &&
      j.MemberExpression.check(declaration.init.callee) &&
      declaration.init.callee.object.name === "Npm" &&
      declaration.init.callee.property.name === "require" &&
      declaration.init.arguments[0].value === "fibers/future"
    ) {
      j(path).remove();
      dirtyFlag = true;
    }
  });

  // Helper function to replace future.throw and future.return
  function replaceFutureCalls(path, futureName) {
    path
      .find(j.CallExpression, {
        callee: {
          type: "MemberExpression",
          object: { name: futureName },
          property: { name: (n) => n === "throw" || n === "return" },
        },
      })
      .forEach((p) => {
        const methodName = p.value.callee.property.name;
        j(p).replaceWith(
          j.callExpression(
            j.identifier(methodName === "throw" ? "reject" : "resolve"),
            p.value.arguments,
          ),
        );
      });
  }

  // Transform the function using Future to an async function returning a Promise
  root.find(j.FunctionDeclaration).forEach((path) => {
    const body = path.node.body.body;
    const futureVarIndex = body.findIndex(
      (statement) =>
        j.VariableDeclaration.check(statement) &&
        statement.declarations[0].init &&
        j.NewExpression.check(statement.declarations[0].init) &&
        statement.declarations[0].init.callee.name === "Future",
    );

    if (futureVarIndex !== -1) {
      const futureName = body[futureVarIndex].declarations[0].id.name;
      const asyncFunc = j.functionDeclaration(
        path.node.id,
        path.node.params,
        j.blockStatement([
          j.returnStatement(
            j.newExpression(j.identifier("Promise"), [
              j.arrowFunctionExpression(
                [j.identifier("resolve"), j.identifier("reject")],
                j.blockStatement(
                  body.slice(futureVarIndex + 1).filter((statement) => {
                    // Remove the future.wait() statement
                    return !(
                      j.ReturnStatement.check(statement) &&
                      j.CallExpression.check(statement.argument) &&
                      j.MemberExpression.check(statement.argument.callee) &&
                      statement.argument.callee.object.name === futureName &&
                      statement.argument.callee.property.name === "wait"
                    );
                  }),
                ),
              ),
            ]),
          ),
        ]),
      );
      asyncFunc.async = true;

      // Replace future.throw and future.return calls
      replaceFutureCalls(j(asyncFunc.body), futureName);

      j(path).replaceWith(asyncFunc);
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
