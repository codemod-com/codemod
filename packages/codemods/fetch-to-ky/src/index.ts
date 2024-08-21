export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Check if `fetch` is used anywhere
  const isFetchUsed =
    root.find(j.CallExpression, { callee: { name: "fetch" } }).size() > 0;

  // Add import statement for `ky` if `fetch` is used
  if (isFetchUsed) {
    const importStatement = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier("ky"))],
      j.literal("ky"),
    );

    // Insert the import statement at the top if not already present
    if (!root.find(j.ImportDeclaration, { source: { value: "ky" } }).size()) {
      root.get().node.program.body.unshift(importStatement);
      dirtyFlag = true;
    }
  }

  // Remove redundant response.ok checks
  root.find(j.IfStatement).forEach((path) => {
    const { test } = path.node;
    if (
      test.type === "UnaryExpression" &&
      test.operator === "!" &&
      test.argument.type === "MemberExpression" &&
      test.argument.property.name === "ok" &&
      test.argument.object.type === "Identifier"
    ) {
      j(path).remove();
      dirtyFlag = true;
    }
  });

  // Replace fetch calls with ky
  root.find(j.CallExpression, { callee: { name: "fetch" } }).forEach((path) => {
    const url = path.node.arguments[0];
    const options = path.node.arguments[1];
    let method = "get";
    let jsonBody = null;

    if (options && j.ObjectExpression.check(options)) {
      const methodProperty = options.properties.find(
        (prop) => prop.key.name === "method",
      );
      if (methodProperty && j.Literal.check(methodProperty.value)) {
        method = methodProperty.value.value.toLowerCase();
      }

      const bodyProperty = options.properties.find(
        (prop) => prop.key.name === "body",
      );
      if (
        bodyProperty &&
        j.CallExpression.check(bodyProperty.value) &&
        bodyProperty.value.callee.object.name === "JSON" &&
        bodyProperty.value.callee.property.name === "stringify"
      ) {
        jsonBody = bodyProperty.value.arguments[0];
      }
    }

    const kyCall = j.callExpression(
      j.memberExpression(j.identifier("ky"), j.identifier(method)),
      jsonBody
        ? [
            url,
            j.objectExpression([
              j.property.from({
                kind: "init",
                key: j.identifier("json"),
                value: jsonBody,
              }),
            ]),
          ]
        : [url],
    );

    // Replace the fetch call with ky() but don't append .json() immediately
    path.replace(kyCall);
    dirtyFlag = true;
  });

  // Ensure .json() is only appended when response is not already handled
  root.find(j.VariableDeclaration).forEach((path) => {
    path.node.declarations.forEach((declarator) => {
      if (
        j.CallExpression.check(declarator.init) &&
        declarator.init.callee.type === "MemberExpression" &&
        declarator.init.callee.object.name === "ky"
      ) {
        const varName = declarator.id.name;

        // Look for subsequent .json() calls and prevent duplicate calls
        const hasJsonCall =
          root
            .find(j.CallExpression, {
              callee: {
                object: { name: varName },
                property: { name: "json" },
              },
            })
            .size() > 0;

        if (!hasJsonCall) {
          declarator.init = j.awaitExpression(
            j.callExpression(
              j.memberExpression(declarator.init, j.identifier("json")),
              [],
            ),
          );
        }
      }
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
}
