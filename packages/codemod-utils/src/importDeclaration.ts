import type {
  ASTPath,
  Collection,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  JSCodeshift,
} from "jscodeshift";

/**
 * Retrieves a named import specifier from an import declaration.
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @param name - The name of the import to retrieve.
 * @returns The import specifier if found, otherwise null.
 */
export const getNamedImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
  name: string,
): ImportSpecifier | null =>
  importDeclaration.value?.specifiers?.find(
    (s): s is ImportSpecifier =>
      j.ImportSpecifier.check(s) && s.imported?.name === name,
  ) ?? null;

/**
 * Retrieves the default import specifier from an import declaration.
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @returns The default import specifier if found, otherwise null.
 */
export const getDefaultImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): ImportDefaultSpecifier | null =>
  importDeclaration.value?.specifiers?.find((s) =>
    j.ImportDefaultSpecifier.check(s),
  ) ?? null;

/**
 * Retrieves the namespace import specifier from an import declaration.
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @returns The namespace import specifier if found, otherwise null.
 */
export const getNamespaceImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): ImportNamespaceSpecifier | null =>
  importDeclaration.value?.specifiers?.find((s) =>
    j.ImportNamespaceSpecifier.check(s),
  ) ?? null;

/**
 * Renames the default import specifier in an import declaration.
 * @param j - The JSCodeshift API.
 * @param newName - The new name for the default import.
 * @param importDeclaration - The import declaration to modify.
 */
export const renameDefaultImport = (
  j: JSCodeshift,
  newName: string,
  importDeclaration: ASTPath<ImportDeclaration>,
): void => {
  importDeclaration.value.specifiers =
    importDeclaration.value.specifiers?.map((s) =>
      j.ImportDefaultSpecifier.check(s)
        ? j.importDefaultSpecifier(j.identifier(newName))
        : s,
    ) ?? [];
};

/**
 * Adds named import specifiers to an import declaration.
 * @param j - The JSCodeshift API.
 * @param names - The names of the imports to add.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the import declaration was modified, otherwise false.
 */
export const addNamedImports = (
  j: JSCodeshift,
  names: string[],
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  let isDirty = false;

  const importSpecifiers = names.map((name) =>
    j.importSpecifier(j.identifier(name), j.identifier(name)),
  );

  importSpecifiers.forEach((importSpecifier) => {
    const specifierExists = importDeclaration.value.specifiers?.some(
      (s) =>
        j.ImportSpecifier.check(s) &&
        s.imported?.name === importSpecifier.imported?.name,
    );

    if (!specifierExists) {
      importDeclaration.value.specifiers?.push(importSpecifier);
      isDirty = true;
    }
  });

  return isDirty;
};

/**
 * Removes named import specifiers from an import declaration.
 * @param j - The JSCodeshift API.
 * @param names - The names of the imports to remove.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the import declaration was modified, otherwise false.
 */
export const removeNamedImports = (
  j: JSCodeshift,
  names: string[],
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  let isDirty = false;

  const newSpecifiers =
    importDeclaration.value?.specifiers?.filter((specifier) =>
      j.ImportSpecifier.check(specifier)
        ? !names.includes(specifier.imported?.name ?? "")
        : true,
    ) ?? [];

  if (newSpecifiers.length === 0) {
    j(importDeclaration).remove();
    isDirty = true;
    return isDirty;
  }

  if (importDeclaration.value.specifiers?.length !== newSpecifiers.length) {
    isDirty = true;
  }

  importDeclaration.value.specifiers = newSpecifiers;

  return isDirty;
};

/**
 * Removes the default import specifier from an import declaration.
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the import declaration was modified, otherwise false.
 */
export const removeDefaultImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  const initialLength = importDeclaration.value.specifiers?.length ?? 0;
  importDeclaration.value.specifiers =
    importDeclaration.value.specifiers?.filter(
      (s) => !j.ImportDefaultSpecifier.check(s),
    ) ?? [];
  return importDeclaration.value.specifiers.length !== initialLength;
};

/**
 * Removes the namespace import specifier from an import declaration.
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the import declaration was modified, otherwise false.
 */
export const removeNamespaceImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  const initialLength = importDeclaration.value.specifiers?.length ?? 0;
  importDeclaration.value.specifiers =
    importDeclaration.value.specifiers?.filter(
      (s) => !j.ImportNamespaceSpecifier.check(s),
    ) ?? [];
  return importDeclaration.value.specifiers.length !== initialLength;
};

/**
 * Checks if an identifier is used in the code.
 * @param j - The JSCodeshift API.
 * @param root - The root collection to search.
 * @param name - The name of the identifier to check.
 * @returns True if the identifier is used, otherwise false.
 */
const isIdentifierUsed = (
  j: JSCodeshift,
  root: Collection,
  name: string,
): boolean =>
  root
    .find(j.Identifier, { name })
    .filter((path) => j(path).closest(j.ImportDeclaration).paths().length === 0)
    .paths().length !== 0;

/**
 * Removes unused import specifiers from an import declaration.
 * @param j - The JSCodeshift API.
 * @param root - The root collection to search.
 * @param source - The source of the import declaration to check.
 */
export const removeUnusedSpecifiers = (
  j: JSCodeshift,
  root: Collection,
  source: string,
): void => {
  root
    .find(j.ImportDeclaration, { source: { value: source } })
    .forEach((path) => {
      const usedSpecifiers =
        path.value.specifiers?.filter((specifier) => {
          const name = specifier.local?.name;
          return name && isIdentifierUsed(j, root, name);
        }) ?? [];

      if (usedSpecifiers.length === 0) {
        j(path).remove();
        return;
      }

      path.value.specifiers = usedSpecifiers;
    });
};

/**
 * Extracts the local names of import specifiers from an import declaration.
 *
 * @param j - The JSCodeshift library.
 * @param importDeclaration - The import declaration path.
 * @returns An object containing the local names of import specifiers,
 *          the name of the default import specifier, and the name of the namespace import specifier.
 */
export const getImportDeclarationNames = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
) => {
  const importSpecifierLocalNames = new Map<string, string>();

  let importDefaultSpecifierName: string | null = null;
  let importNamespaceSpecifierName: string | null = null;

  importDeclaration?.value.specifiers?.forEach((specifier) => {
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

  return {
    importSpecifierLocalNames,
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
  };
};

/**
 * Checks if an import declaration has a specified local name.
 * import { a as b } from 'lib' // "a" is imported name, "b" is local name
 *
 * @param j - The JSCodeshift library.
 * @param name - The local name to check for.
 * @param importDeclaration - The import declaration path.
 * @returns True if the import declaration contains the specified local name, false otherwise.
 */
export const importDeclarationHasLocalName = (
  j: JSCodeshift,
  name: string,
  importDeclaration: ASTPath<ImportDeclaration>,
) => {
  const {
    importSpecifierLocalNames,
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
  } = getImportDeclarationNames(j, importDeclaration);

  const importedModuleName =
    importNamespaceSpecifierName ?? importDefaultSpecifierName;

  return (
    importedModuleName === name ||
    [...importSpecifierLocalNames.values()].includes(name)
  );
};

export const getNamedImportImportedName = (
  j: JSCodeshift,
  name: string,
  importDeclaration: ASTPath<ImportDeclaration>,
) => {
  const { importSpecifierLocalNames } = getImportDeclarationNames(
    j,
    importDeclaration,
  );

  return importSpecifierLocalNames.get(name);
};
