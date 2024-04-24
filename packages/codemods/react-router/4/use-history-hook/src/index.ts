import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;

  const root = j(file.source);

  root
    .find(j.ImportDeclaration, {
      source: {
        value: "react-router-dom",
      },
    })
    .replaceWith((path) => {
      if (!path.value.specifiers) {
        return path.node;
      }

      const browserHistoryImportSpecifier = path.value.specifiers.find(
        (specifier) => {
          if (!j.ImportSpecifier.check(specifier)) {
            return false;
          }

          return specifier.imported.name === "browserHistory";
        },
      );
      if (browserHistoryImportSpecifier) {
        return j.importDeclaration(
          [j.importSpecifier(j.identifier("useHistory"))],
          j.literal("react-router-dom"),
        );
      }
      return path.node;
    });

  root
    .find(j.Identifier, {
      name: "browserHistory",
    })
    .forEach((path) => {
      const functionalComponentAncestor =
        j(path).closest(j.FunctionDeclaration) ??
        j(path).closest(j.ArrowFunctionExpression);

      if (!functionalComponentAncestor.length) {
        // Arrow Functions in which `browserHistory` is used might not be found.
        // In this case, simply replace `browserHistory` with `useHistory()`.
        path.replace(j.callExpression(j.identifier("useHistory"), []));
        return;
      }

      const value = functionalComponentAncestor.get().value;

      if (value.type === "CallExpression") {
        return;
      }

      const browserHistoryDeclaration = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier("browserHistory"),
          j.callExpression(j.identifier("useHistory"), []),
        ),
      ]);
      value.body.body.unshift(browserHistoryDeclaration);
    });

  return root.toSource();
}

export default transform;
