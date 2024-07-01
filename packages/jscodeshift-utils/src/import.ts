import type {
  ASTPath,
  Collection,
  ImportDeclaration,
  JSCodeshift,
} from "jscodeshift";

/**
 * finds the namespace specifier, default import, and map of imported to local names
 */
export const analyzeImport = (
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

const isIdentifierUsed = (j: JSCodeshift, root: Collection, name: string) =>
  root
    .find(j.Identifier, {
      name,
    })
    .filter((path) => j(path).closest(j.ImportDeclaration).paths().length === 0)
    .paths().length !== 0;

export const removeUnusedSpecifiers = (
  j: JSCodeshift,
  root: Collection,
  source: string,
) => {
  root
    .find(j.ImportDeclaration, {
      source: { value: source },
    })
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

export const getImportByName = (
  j: JSCodeshift,
  root: Collection<any>,
  name: string,
): ASTPath<ImportDeclaration> | null =>
  root
    .find(j.ImportDeclaration, {
      source: { value: name },
    })
    .paths()
    .at(0) ?? null;

export const addNamedImport = (
  j: JSCodeshift,
  root: Collection<any>,
  importName: string,
  sourceName: string,
) => {
  const existingImportDeclaration = getImportByName(j, root, sourceName)?.value;
  const importDeclaration =
    existingImportDeclaration ?? j.importDeclaration([], j.literal(sourceName));

  const importSpecifier = j.importSpecifier(
    j.identifier(importName),
    j.identifier(importName),
  );

  const specifierExists = importDeclaration.specifiers?.some((s) => {
    return s.local?.name === importSpecifier.imported.name;
  });

  if (!specifierExists) {
    importDeclaration.specifiers?.push(importSpecifier);
  }

  if (!existingImportDeclaration) {
    const body = root.get().node.program.body;
    body.unshift(importDeclaration);
  }
};

export const removeNamedImport = (
  j: JSCodeshift,
  root: Collection<any>,
  importName: string,
  source: string,
) => {
  root
    .find(j.ImportDeclaration, {
      source: { value: source },
    })
    .forEach((path) => {
      const usedSpecifiers =
        path.value.specifiers?.filter(
          (specifier) => specifier.local?.name !== importName,
        ) ?? [];

      if (usedSpecifiers.length === 0) {
        j(path).remove();
        return;
      }

      path.value.specifiers = usedSpecifiers;
    });
};
