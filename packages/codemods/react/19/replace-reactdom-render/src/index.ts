import type {
  API,
  ASTPath,
  CallExpression,
  Collection,
  FileInfo,
  JSCodeshift,
} from "jscodeshift";

const getMatcher =
  (
    j: JSCodeshift,
    importSpecifiersLocalNames: string[],
    importedModuleName: string,
  ) =>
  (path: ASTPath<CallExpression>) => {
    const { callee } = path.value;

    if (
      j.Identifier.check(callee) &&
      importSpecifiersLocalNames.includes(callee.name)
    ) {
      return callee.name;
    }

    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === importedModuleName &&
      j.Identifier.check(callee.property)
    ) {
      return callee.property.name;
    }

    return null;
  };

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
    importDeclaration.specifiers?.push(importSpecifier);
  }

  if (!existingImportDeclaration) {
    const body = root.get().node.program.body;
    body.unshift(importDeclaration);
  }
};

const collectImportNames = (
  j: JSCodeshift,
  root: Collection,
  source: string,
) => {
  const importSpecifierLocalNames = new Map<string, string>();

  let importDefaultSpecifierName: string | null = null;
  let importNamespaceSpecifierName: string | null = null;

  root
    .find(j.ImportDeclaration, {
      source: { value: source },
    })
    .forEach((path) => {
      path.value.specifiers?.forEach((specifier) => {
        if (j.ImportSpecifier.check(specifier)) {
          importSpecifierLocalNames.set(
            specifier.imported.name,
            specifier.local?.name ?? "",
          );
        }

        if (j.ImportDefaultSpecifier.check(specifier) && specifier.local) {
          importDefaultSpecifierName = specifier.local.name;
        }

        if (j.ImportNamespaceSpecifier.check(specifier) && specifier.local) {
          importNamespaceSpecifierName = specifier.local.name;
        }
      });
    });

  return {
    importSpecifierLocalNames,
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
  };
};

const replaceHydrate = (
  j: JSCodeshift,
  root: Collection,
  path: ASTPath<CallExpression>,
) => {
  const args = path.value.arguments;

  const hydrateRoot = j.expressionStatement(
    j.callExpression(j.identifier("hydrateRoot"), [args[1], args[0]]),
  );

  addNamedImport(j, root, "hydrateRoot", "react-dom/client");
  path.parent.replace(hydrateRoot);
};

const replaceRender = (
  j: JSCodeshift,
  root: Collection,
  path: ASTPath<CallExpression>,
) => {
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

  addNamedImport(j, root, "createRoot", "react-dom/client");

  path.parent.replace(createRoot);
  path.parent.insertAfter(render);
};

const replaceUnmountComponentAtNode = (
  j: JSCodeshift,
  root: Collection,
  path: ASTPath<CallExpression>,
) => {
  const args = path.value.arguments;

  const createRoot = j.variableDeclaration("const", [
    j.variableDeclarator(
      j.identifier("root"),
      j.callExpression(j.identifier("createRoot"), [args[0]]),
    ),
  ]);

  const unmount = j.expressionStatement(
    j.callExpression(
      j.memberExpression(j.identifier("root"), j.identifier("unmount")),
      [],
    ),
  );

  addNamedImport(j, root, "createRoot", "react-dom/client");

  path.parent.replace(createRoot);
  path.parent.insertAfter(unmount);
};

const replacementFunctions: Record<string, (...args: any) => any> = {
  render: replaceRender,
  hydrate: replaceHydrate,
  unmountComponentAtNode: replaceUnmountComponentAtNode,
};

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = collectImportNames(j, root, "react-dom");

  const importedModuleName =
    importDefaultSpecifierName ?? importNamespaceSpecifierName ?? "";

  const matchMethod = getMatcher(
    j,
    [...importSpecifierLocalNames.values()],
    importedModuleName,
  );

  root.find(j.CallExpression).forEach((path) => {
    const match = matchMethod(path);

    if (match === null) {
      return;
    }

    const replaceMethod = replacementFunctions[match];

    replaceMethod(j, root, path);
    isDirty = true;
  });

  return isDirty ? root.toSource() : undefined;
}
