export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Transform Promise.await to async/await
  root
    .find(j.CallExpression, {
      callee: { object: { name: "Promise" }, property: { name: "await" } },
    })
    .forEach((path) => {
      const func = j(path).closest(j.FunctionDeclaration);
      if (func.size() > 0) {
        func.get().node.async = true;
        path.replace(j.awaitExpression(path.node.arguments[0]));
        dirtyFlag = true;
      }
    });

  // Transform Meteor.wrapAsync to async/await
  root
    .find(j.CallExpression, {
      callee: { object: { name: "Meteor" }, property: { name: "wrapAsync" } },
    })
    .forEach((path) => {
      const wrappedFuncName = path.parentPath.node.id.name;
      const originalFunc = path.node.arguments[0].name;

      // Remove the wrapped function declaration
      j(path.parentPath).remove();
      dirtyFlag = true;

      // Update the function using the wrapped function
      root
        .find(j.FunctionDeclaration)
        .filter((funcPath) => {
          return (
            j(funcPath).find(j.Identifier, { name: wrappedFuncName }).size() > 0
          );
        })
        .forEach((funcPath) => {
          funcPath.node.async = true;
          j(funcPath)
            .find(j.CallExpression, { callee: { name: wrappedFuncName } })
            .replaceWith((callPath) =>
              j.awaitExpression(
                j.callExpression(
                  j.identifier(originalFunc),
                  callPath.node.arguments,
                ),
              ),
            );
          dirtyFlag = true;
        });
    });

  return dirtyFlag ? root.toSource() : undefined;
}
