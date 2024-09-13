export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Check if 'path' is already required
  const isPathRequired =
    root
      .find(j.VariableDeclaration)
      .filter((path) => {
        const decl = path.node.declarations[0];
        return (
          j.CallExpression.check(decl.init) &&
          j.Identifier.check(decl.init.callee) &&
          decl.init.callee.name === "require" &&
          j.Literal.check(decl.init.arguments[0]) &&
          decl.init.arguments[0].value === "path"
        );
      })
      .size() > 0;

  // Replace require statements and remove the original
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      const decl = path.node.declarations[0];
      return (
        j.CallExpression.check(decl.init) &&
        j.Identifier.check(decl.init.callee) &&
        decl.init.callee.name === "require" &&
        j.Literal.check(decl.init.arguments[0]) &&
        ["minimatch", "micromatch", "picomatch"].includes(
          decl.init.arguments[0].value,
        )
      );
    })
    .forEach((path) => {
      // Only add require('path') if it doesn't exist
      if (!isPathRequired) {
        // Replace with require('path')
        path.replace(
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("path"),
              j.callExpression(j.identifier("require"), [j.literal("path")]),
            ),
          ]),
        );
        dirtyFlag = true;
      } else {
        // If path is already required, just remove the old require statement
        path.prune();
      }
    });

  // Replace import statements and remove the original
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const source = path.node.source;
      return (
        j.Literal.check(source) &&
        ["minimatch", "micromatch", "picomatch"].includes(source.value)
      );
    })
    .forEach((path) => {
      // Replace with import path
      path.node.source = j.literal("path");
      path.node.specifiers = [j.importDefaultSpecifier(j.identifier("path"))];
      dirtyFlag = true;
    });

  // Replace function calls
  root
    .find(j.CallExpression)
    .filter((path) => {
      const callee = path.node.callee;
      return (
        j.Identifier.check(callee) &&
        ["minimatch", "micromatch", "picomatch"].includes(callee.name)
      );
    })
    .forEach((path) => {
      const callee = path.node.callee;
      if (callee.name === "micromatch") {
        const files = path.node.arguments[0];
        const pattern = path.node.arguments[1];
        path.replace(
          j.callExpression(j.memberExpression(files, j.identifier("filter")), [
            j.arrowFunctionExpression(
              [j.identifier("file")],
              j.callExpression(
                j.memberExpression(
                  j.identifier("path"),
                  j.identifier("matchesGlob"),
                ),
                [j.identifier("file"), pattern],
              ),
            ),
          ]),
        );
      } else if (callee.name === "picomatch") {
        const pattern = path.node.arguments[0];
        root
          .find(j.CallExpression, {
            callee: { name: path.parentPath.node.id.name },
          })
          .forEach((callPath) => {
            callPath.replace(
              j.callExpression(
                j.memberExpression(
                  j.identifier("path"),
                  j.identifier("matchesGlob"),
                ),
                [callPath.node.arguments[0], pattern],
              ),
            );
          });
        path.prune();
      } else {
        path.node.callee = j.memberExpression(
          j.identifier("path"),
          j.identifier("matchesGlob"),
        );
      }
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
