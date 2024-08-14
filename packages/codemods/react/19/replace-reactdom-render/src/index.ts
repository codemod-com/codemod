import type {
  API,
  ASTPath,
  CallExpression,
  Collection,
  FileInfo,
  JSCodeshift,
} from "jscodeshift";

import {
  addImportDeclaration,
  addNamedImports,
  getImportDeclaration,
  getImportDeclarationNames,
} from "@codemod.com/codemod-utils";

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

const replaceHydrate = (
  j: JSCodeshift,
  root: Collection,
  path: ASTPath<CallExpression>,
) => {
  const args = path.value.arguments;

  const hydrateRoot = j.expressionStatement(
    j.callExpression(j.identifier("hydrateRoot"), [args[1], args[0]]),
  );

  const importDeclaration = addImportDeclaration(j, root, "react-dom/client");
  addNamedImports(j, ["hydrateRoot"], importDeclaration);
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

  const importDeclaration = addImportDeclaration(j, root, "react-dom/client");
  addNamedImports(j, ["createRoot"], importDeclaration);

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

  const importDeclaration = addImportDeclaration(j, root, "react-dom/client");
  addNamedImports(j, ["createRoot"], importDeclaration);

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

  const importDeclaration = getImportDeclaration(j, root, "react-dom");

  if (!importDeclaration) {
    return;
  }

  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = getImportDeclarationNames(j, importDeclaration);

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

    if (replaceMethod) {
      replaceMethod(j, root, path);
      isDirty = true;
    }
  });

  return isDirty ? root.toSource() : undefined;
}
