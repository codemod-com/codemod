import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const importedIdentifiers: string[] = [];

  root
    .find(j.ImportDeclaration, {
      source: {
        value: "@prisma/client/runtime",
      },
    })
    .forEach((path) => {
      if (path.node.specifiers) {
        path.node.specifiers.forEach((specifier) => {
          if (j.ImportSpecifier.check(specifier) && specifier.local) {
            importedIdentifiers.push(specifier.local.name);
          }
        });

        path.replace(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("Prisma"))],
            j.stringLiteral("@prisma/client"),
          ),
        );
      }
    });

  importedIdentifiers.forEach((identifier) => {
    root
      .find(j.NewExpression, {
        callee: { name: identifier },
      })
      .forEach((newPath) => {
        newPath
          .get("callee")
          .replace(
            j.memberExpression(
              j.identifier("Prisma"),
              j.identifier(identifier),
            ),
          );
      });
  });

  return root.toSource();
}

export default transform;
