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
 * Finds the named import specifier within the given import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @param name - The name of the import to find.
 * @returns The import specifier if found, otherwise `null`.
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
 * Finds the default import specifier within the given import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @returns The default import specifier if found, otherwise `null`.
 */
export const getDefaultImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): ImportDefaultSpecifier | null =>
  importDeclaration.value?.specifiers?.find((s) =>
    j.ImportDefaultSpecifier.check(s),
  ) ?? null;

/**
 * Finds the namespace import specifier within the given import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to search.
 * @returns The namespace import specifier if found, otherwise `null`.
 */
export const getNamespaceImport = (
  j: JSCodeshift,
  importDeclaration: ASTPath<ImportDeclaration>,
): ImportNamespaceSpecifier | null =>
  importDeclaration.value?.specifiers?.find((s) =>
    j.ImportNamespaceSpecifier.check(s),
  ) ?? null;

/**
 * Renames the default import specifier in the given import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param newName - The new name for the default import specifier.
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

  if (j.Identifier.check(importDefaultSpecifier?.local)) {
    importDefaultSpecifier.local.name = newName;
    isRenamed = true;
  }

  return isRenamed;
};

/**
 * Adds new named import specifiers to an existing import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param names - The names of the imports to add.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if any new import specifiers were added, otherwise false.
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
 * Removes the specified named imports from an import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param names - The names of the imports to remove.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if any named imports were removed, otherwise false.
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
 * Removes the default import from an import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the default import was removed, otherwise false.
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
 * Removes the namespace import from an import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if the namespace import was removed, otherwise false.
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
 *
 * @param j - The JSCodeshift API.
 * @param root - The root of the AST.
 * @param importDeclaration - The import declaration to modify.
 * @returns True if any specifiers were removed, otherwise false.
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
 * Retrieves the names of the import specifiers, default import, and namespace import from an import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param importDeclaration - The import declaration to extract the names from.
 * @returns An object containing the names of the import specifiers, default import, and namespace import.
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
 * Checks if an import declaration contains a local name matching the provided name.
 *
 * @param j - The JSCodeshift API.
 * @param name - The name to check for in the import declaration.
 * @param importDeclaration - The import declaration to check.
 * @returns `true` if the import declaration contains a local name matching the provided name, `false` otherwise.
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
 * Gets the local name of a named import in an import declaration.
 *
 * @param j - The JSCodeshift API.
 * @param name - The name of the imported module to find the local name for.
 * @param importDeclaration - The import declaration to search.
 * @returns The local name of the named import, or `null` if the name is not found.
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
