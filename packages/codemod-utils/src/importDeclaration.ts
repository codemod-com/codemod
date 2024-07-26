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
 * @param name - The imported name of the named import to retrieve.
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
 * @returns True if the import declaration was modified, otherwise false.
 */
export const renameDefaultImport = (
  j: JSCodeshift,
  newName: string,
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  let isRenamed = false;

  const importDefaultSpecifier = importDeclaration.value.specifiers?.find((s) =>
    j.ImportDefaultSpecifier.check(s),
  );

  if (j.Identifier.check(importDefaultSpecifier?.name)) {
    importDefaultSpecifier.name.name = newName;
    isRenamed = true;
  }

  return isRenamed;
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
  let isAdded = false;

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
      isAdded = true;
    }
  });

  return isAdded;
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
  let isRemoved = false;

  const newSpecifiers =
    importDeclaration.value?.specifiers?.filter((specifier) =>
      j.ImportSpecifier.check(specifier)
        ? !names.includes(specifier.imported?.name ?? "")
        : true,
    ) ?? [];

  if (newSpecifiers.length === 0) {
    j(importDeclaration).remove();
    isRemoved = true;
    return isRemoved;
  }

  if (importDeclaration.value.specifiers?.length !== newSpecifiers.length) {
    isRemoved = true;
  }

  importDeclaration.value.specifiers = newSpecifiers;

  return isRemoved;
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
 * @param importDeclaration - The import declaration to modify.
 */
export const removeUnusedSpecifiers = (
  j: JSCodeshift,
  root: Collection,
  importDeclaration: ASTPath<ImportDeclaration>,
): boolean => {
  let isRemoved = false;

  const usedSpecifiers =
    importDeclaration.value.specifiers?.filter((specifier) => {
      const name = specifier.local?.name;
      return name && isIdentifierUsed(j, root, name);
    }) ?? [];

  // remove ImportDeclaration if no specifiers left after unused specifiers removal
  if (usedSpecifiers.length === 0) {
    j(importDeclaration).remove();
    isRemoved = true;
    return isRemoved;
  }

  if (importDeclaration.value.specifiers?.length !== usedSpecifiers.length) {
    isRemoved = true;
  }

  importDeclaration.value.specifiers = usedSpecifiers;

  return isRemoved;
};

type ImportDeclarationNames = {
  importDefaultSpecifierName: string | null;
  importNamespaceSpecifierName: string | null;
  importSpecifierLocalNames: Map<string, string>;
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
): ImportDeclarationNames => {
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

/**
 * Retrieves the local name of a named import from an ImportDeclaration.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param name - The local name of the named import to look for.
 * @param importDeclaration - The ImportDeclaration AST node to search within.
 * @returns The local name of the named import if found, otherwise undefined.
 */
export const getNamedImportLocalName = (
  j: JSCodeshift,
  name: string,
  importDeclaration: ASTPath<ImportDeclaration>,
): string | null => {
  const { importSpecifierLocalNames } = getImportDeclarationNames(
    j,
    importDeclaration,
  );

  return importSpecifierLocalNames.get(name) ?? null;
};
