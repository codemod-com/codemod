export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all import declarations from 'preact'
  root
    .find(j.ImportDeclaration, { source: { value: "preact" } })
    .forEach((path) => {
      // Check if the import is a default import
      const defaultImportSpecifier = path.node.specifiers.find(
        (specifier) => specifier.type === "ImportDefaultSpecifier",
      );

      if (defaultImportSpecifier) {
        // Replace the default import with a namespace import
        path.node.specifiers = [
          j.importNamespaceSpecifier(j.identifier("preact")),
        ];
      }
    });

  return root.toSource();
}
