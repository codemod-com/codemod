export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  // Check if `props.children` is used in the code
  const propsChildrenUsage = root.find(j.MemberExpression, {
    object: {
      type: "MemberExpression",
      object: { type: "Identifier", name: "props" },
      property: { type: "Identifier", name: "children" },
    },
  });
  // Add import for `toChildArray` from 'preact' if it doesn't exist
  if (propsChildrenUsage.size() > 0) {
    // Add import for `toChildArray` from 'preact' if it doesn't exist
    const preactImport = root.find(j.ImportDeclaration, {
      source: { value: "preact" },
    });

    if (preactImport.size() === 0) {
      root
        .get()
        .node.program.body.unshift(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("toChildArray"))],
            j.literal("preact"),
          ),
        );
    } else {
      preactImport.forEach((path) => {
        const hasToChildArray = path.node.specifiers.some(
          (specifier) =>
            specifier.imported && specifier.imported.name === "toChildArray",
        );
        if (!hasToChildArray) {
          path.node.specifiers.push(
            j.importSpecifier(j.identifier("toChildArray")),
          );
        }
      });
    }

    // Replace `props.children.length` with `toChildArray(props.children).length`
    root
      .find(j.MemberExpression, {
        object: {
          type: "MemberExpression",
          object: { type: "Identifier", name: "props" },
          property: { type: "Identifier", name: "children" },
        },
        property: { type: "Identifier", name: "length" },
      })
      .forEach((path) => {
        j(path).replaceWith(
          j.memberExpression(
            j.callExpression(j.identifier("toChildArray"), [
              j.memberExpression(
                j.identifier("props"),
                j.identifier("children"),
              ),
            ]),
            j.identifier("length"),
          ),
        );
      });

    // Ensure the import statement for `preact` is correctly transformed to `import * as preact from 'preact';`
    preactImport.forEach((path) => {
      path.node.specifiers = [
        j.importNamespaceSpecifier(j.identifier("preact")),
      ];
    });
  }

  return root.toSource();
}
