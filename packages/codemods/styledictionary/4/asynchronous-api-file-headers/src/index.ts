export default function transformer(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  // Check if the file imports from or references 'style-dictionary'
  const hasStyleDictionaryReference =
    root
      .find(j.ImportDeclaration)
      .some((path) => path.node.source.value.includes("style-dictionary")) ||
    root
      .find(j.VariableDeclaration)
      .filter((path) => {
        return path.node.declarations.some((declaration) => {
          return (
            declaration.init &&
            declaration.init.type === "CallExpression" &&
            declaration.init.callee.name === "require" &&
            declaration.init.arguments[0].value.includes("style-dictionary")
          );
        });
      })
      .size() > 0;

  if (!hasStyleDictionaryReference) {
    // If there's no reference to 'style-dictionary', do not process the file
    return;
  }

  // Step 1: Handle cases where `formatter` needs to be renamed to `format`
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "StyleDictionary" },
        property: { name: "registerFormat" },
      },
    })
    .forEach((path) => {
      const properties = path.node.arguments[0].properties;

      properties.forEach((prop) => {
        // Rename 'formatter' to 'format' whether it's an inline function or a named function
        if (prop.key.name === "formatter") {
          prop.key.name = "format";

          // If it's an inline function, ensure it is async and add 'await' to 'fileHeader'
          if (
            j.FunctionExpression.check(prop.value) ||
            j.ArrowFunctionExpression.check(prop.value)
          ) {
            prop.value.async = true;
            j(prop.value.body)
              .find(j.CallExpression, {
                callee: { name: "fileHeader" },
              })
              .forEach((fileHeaderPath) => {
                // Check if `fileHeader` is already awaited
                if (!j.AwaitExpression.check(fileHeaderPath.parentPath.node)) {
                  // Replace `fileHeader()` with `await fileHeader()`
                  j(fileHeaderPath).replaceWith(() =>
                    j.awaitExpression(fileHeaderPath.node),
                  );
                }
              });
          }

          // If it's a named function (e.g., `cssThemed`), find the function definition
          if (j.Identifier.check(prop.value)) {
            const functionName = prop.value.name;

            // Find the function declaration and ensure it's async, and add 'await' to 'fileHeader'
            root
              .find(j.FunctionDeclaration, {
                id: { name: functionName },
              })
              .forEach((funcPath) => {
                funcPath.node.async = true;

                j(funcPath.node.body)
                  .find(j.CallExpression, {
                    callee: { name: "fileHeader" },
                  })
                  .forEach((fileHeaderPath) => {
                    // Check if `fileHeader` is already awaited
                    if (
                      !j.AwaitExpression.check(fileHeaderPath.parentPath.node)
                    ) {
                      // Replace `fileHeader()` with `await fileHeader()`
                      j(fileHeaderPath).replaceWith(() =>
                        j.awaitExpression(fileHeaderPath.node),
                      );
                    }
                  });
              });
          }
        }
      });

      // Step 2: Ensure all `fileHeader` calls within `registerFormat` are awaited
      j(path)
        .find(j.CallExpression, {
          callee: { name: "fileHeader" },
        })
        .forEach((fileHeaderPath) => {
          // Check if `fileHeader` is already awaited
          if (!j.AwaitExpression.check(fileHeaderPath.parentPath.node)) {
            const funcPath = j(fileHeaderPath).closest(j.Function);

            // Ensure the enclosing function is async
            if (funcPath.size() > 0) {
              const funcNode = funcPath.get().node;
              funcNode.async = true;
            }

            // Replace `fileHeader()` with `await fileHeader()`
            j(fileHeaderPath).replaceWith(() =>
              j.awaitExpression(fileHeaderPath.node),
            );
          }
        });
    });

  return root.toSource();
}
