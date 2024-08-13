import type {
  ASTPath,
  Collection,
  ExportDefaultDeclaration,
  File,
  ImportDeclaration,
  JSCodeshift,
} from "jscodeshift";

/**
 * Gets the first import declaration with the specified source value.
 *
 * @param j - The JSCodeshift API.
 * @param root - The root collection of the AST.
 * @param name - The source value to search for.
 * @returns The AST path of the first matching import declaration, or null if not found.
 */
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

/**
 * Adds an import declaration to the AST with the specified source value.
 *
 * @param j - The JSCodeshift API.
 * @param root - The root collection of the AST.
 * @param name - The source value of the import declaration to add.
 * @returns The AST path of the added import declaration.
 */
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

/**
 * Inserts the provided statements after the last import declaration in the AST.
 *
 * @param j - The JSCodeshift API.
 * @param root - The root collection of the AST.
 * @param statements - The statements to insert after the last import declaration.
 */
export const insertStatementAfterImports = (
  j: JSCodeshift,
  root: Collection<File>,
  statements: any[],
) => {
  const programBody = root.find(j.Program).paths()[0]?.value.body ?? [];

  const lastImportDeclarationIndex = programBody.findLastIndex((node) =>
    j.ImportDeclaration.check(node),
  );

  programBody.splice(lastImportDeclarationIndex + 1, 0, ...statements);
};

/**
 * Gets the default export declaration from the provided AST root.
 *
 * @param j - The JSCodeshift API.
 * @param root - The root collection of the AST.
 * @returns The AST path of the default export declaration, or null if not found.
 */
export const getDefaultExport = (
  j: JSCodeshift,
  root: Collection<any>,
): ASTPath<ExportDefaultDeclaration> | null =>
  root.find(j.ExportDefaultDeclaration).paths()?.at(0) ?? null;

/**
 * Checks if the provided AST path is defined in the global scope.
 *
 * @param j - The JSCodeshift API.
 * @param path - The AST path to check.
 * @returns `true` if the path is defined in the global scope, `false` otherwise.
 */
export const isDefinedInGlobalScope = (j: JSCodeshift, path: ASTPath<any>) => {
  return j(path).closest(j.BlockStatement).paths().length === 0;
};
