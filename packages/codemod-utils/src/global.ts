import type {
  ASTPath,
  Collection,
  ExportDefaultDeclaration,
  File,
  ImportDeclaration,
  JSCodeshift,
} from "jscodeshift";

export const getImportDeclaration = (
  j: JSCodeshift,
  root: Collection<File>,
  name: string,
): ASTPath<ImportDeclaration> | null =>
  root
    .find(j.ImportDeclaration, {
      source: { value: name },
    })
    .paths()
    .at(0) ?? null;

export const addImportDeclaration = (
  j: JSCodeshift,
  root: Collection<File>,
  name: string,
): ASTPath<ImportDeclaration> => {
  const existingImportDeclaration = getImportDeclaration(j, root, name);

  if (existingImportDeclaration) {
    return existingImportDeclaration;
  }

  const importDeclaration = j.importDeclaration([], j.stringLiteral(name));
  root.get().node.program.body.unshift(importDeclaration);

  // @TODO
  return j(importDeclaration).paths().at(0)!;
};

export const insertStatementAfterImports = (
  j: JSCodeshift,
  root: Collection<File>,
  statements: any[],
) => {
  const programBody = root.find(j.Program).paths()[0]?.value.body ?? [];

  // @ts-expect-error findLastIndex
  const lastImportDeclarationIndex = findLastIndex(programBody, (node) =>
    j.ImportDeclaration.check(node),
  );

  programBody.splice(lastImportDeclarationIndex + 1, 0, ...statements);
};

export const getDefaultExport = (
  j: JSCodeshift,
  root: Collection<any>,
): ASTPath<ExportDefaultDeclaration> | null =>
  root.find(j.ExportDefaultDeclaration).paths()?.at(0) ?? null;

export const isDefinedInGlobalScope = (j: JSCodeshift, path: ASTPath<any>) => {
  return j(path).closest(j.BlockStatement).paths().length === 0;
};
