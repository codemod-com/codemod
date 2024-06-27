import type { Collection, JSCodeshift } from "jscodeshift";

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
