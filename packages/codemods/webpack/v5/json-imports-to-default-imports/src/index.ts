export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all import declarations
  root.find(j.ImportDeclaration).forEach((path) => {
    const importPath = path.node.source.value;

    // Check if the import is from a JSON file
    if (importPath.endsWith('.json')) {
      const specifiers = path.node.specifiers;

      // Check if there are named imports
      if (
        specifiers.some((specifier) =>
          j.ImportSpecifier.check(specifier),
        )
      ) {
        const defaultImportIdentifier = j.identifier('pkg');

        // Create a new default import declaration with single quotes
        const newImportDeclaration = j.importDeclaration(
          [j.importDefaultSpecifier(defaultImportIdentifier)],
          j.literal(importPath),
        );

        // Replace the old import declaration with the new one
        j(path).replaceWith(newImportDeclaration);

        // Replace all references to the named imports with properties on the default import
        specifiers.forEach((specifier) => {
          if (j.ImportSpecifier.check(specifier)) {
            const localName = specifier.local.name;
            const importedName = specifier.imported.name;

            root.find(j.Identifier, { name: localName }).forEach(
              (identifierPath) => {
                j(identifierPath).replaceWith(
                  j.memberExpression(
                    defaultImportIdentifier,
                    j.identifier(importedName),
                  ),
                );
              },
            );
          }
        });

        dirtyFlag = true;
      }
    }
  });

  // Use 'single' quotes in the final output
  return dirtyFlag ? root.toSource({ quote: 'single' }) : undefined;
}