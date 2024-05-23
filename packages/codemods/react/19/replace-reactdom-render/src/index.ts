import type {
  API,
  Collection,
  FileInfo,
  JSCodeshift,
  Options,
} from "jscodeshift";

const findMethodCalls = (
  j: JSCodeshift,
  root: Collection<any>,
  methodName: string,
  namedImportLocalName: string,
  defaultImportName: string,
) =>
  root.find(j.CallExpression).filter((path) => {
    const { callee } = path.value;

    if (j.Identifier.check(callee) && callee.name === namedImportLocalName) {
      return true;
    }

    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === defaultImportName &&
      j.Identifier.check(callee.property) &&
      callee.property.name === methodName
    ) {
      return true;
    }

    return false;
  });

const getImportDeclaration = (
  j: JSCodeshift,
  root: Collection<any>,
  importName: string,
) =>
  root
    .find(j.ImportDeclaration, {
      source: { value: importName },
    })
    .paths()
    .at(0)?.node;

const buildImportDeclaration = (j: JSCodeshift, sourceName: string) => {
  return j.importDeclaration([], j.literal(sourceName));
};

const addNamedImport = (
  j: JSCodeshift,
  root: Collection<any>,
  importName: string,
  sourceName: string,
) => {
  const existingImportDeclaration = getImportDeclaration(j, root, sourceName);
  const importDeclaration =
    existingImportDeclaration ?? buildImportDeclaration(j, sourceName);

  const importSpecifier = j.importSpecifier(j.identifier(importName));

  if (
    importDeclaration.specifiers?.findIndex(
      (s) =>
        importSpecifier.imported &&
        s.local?.name === importSpecifier.imported.name,
    ) === -1
  ) {
    console.log("HERE???");
    importDeclaration.specifiers?.push(importSpecifier);
  }

  if (!existingImportDeclaration) {
    const body = root.get().node.program.body;
    body.unshift(importDeclaration);
  }
};

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const reactNamedImportNamesToLocalNamesMap = new Map<string, string>();

  let reactDomDefaultImportName: string | null = null;

  let isDirty = false;
  root
    .find(j.ImportDeclaration, {
      source: { value: "react-dom" },
    })
    .forEach((path) => {
      path.value.specifiers?.forEach((specifier) => {
        // named import
        if (j.ImportSpecifier.check(specifier)) {
          reactNamedImportNamesToLocalNamesMap.set(
            specifier.imported.name,
            specifier.local?.name ?? "",
          );
        }

        // default and wildcard import
        if (
          j.ImportDefaultSpecifier.check(specifier) ||
          j.ImportNamespaceSpecifier.check(specifier)
        ) {
          reactDomDefaultImportName = specifier.local?.name ?? null;
        }
      });
    });

  /**
   * replace ReactDOM.hydrate
   */

  findMethodCalls(
    j,
    root,
    "hydrate",
    reactNamedImportNamesToLocalNamesMap.get("hydrate") ?? "",
    reactDomDefaultImportName ?? "",
  ).forEach((path) => {
    const args = path.value.arguments;

    const hydrateRoot = j.expressionStatement(
      j.callExpression(j.identifier("hydrateRoot"), [args[1], args[0]]),
    );

    isDirty = true;

    addNamedImport(j, root, "hydrateRoot", "react-dom/client");
    path.parent.replace(hydrateRoot);
  });

  /**
   * replace ReactDOM.render
   */
  findMethodCalls(
    j,
    root,
    "render",
    reactNamedImportNamesToLocalNamesMap.get("render") ?? "",
    reactDomDefaultImportName ?? "",
  ).forEach((path) => {
    const args = path.value.arguments;

    const createRoot = j.variableDeclaration("const", [
      j.variableDeclarator(
        j.identifier("root"),
        j.callExpression(j.identifier("createRoot"), [args[1]]),
      ),
    ]);

    const render = j.expressionStatement(
      j.callExpression(
        j.memberExpression(j.identifier("root"), j.identifier("render")),
        [args[0]],
      ),
    );

    isDirty = true;
    addNamedImport(j, root, "createRoot", "react-dom/client");

    path.parent.replace(createRoot);
    path.parent.insertAfter(render);
  });

  return isDirty ? root.toSource() : undefined;
}
