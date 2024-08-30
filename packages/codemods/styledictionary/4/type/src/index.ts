import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
    file: FileInfo,
    api: API,
    options?: Options,
  ): string | undefined {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Find the import statement for 'style-dictionary'
    const importDecl = root.find(j.ImportDeclaration, {
        source: { value: 'style-dictionary' },
    });

    if (importDecl.size()) {
        // Collect all relevant type declarations
        const typeDeclarations = root
            .find(j.TSTypeAliasDeclaration)
            .filter((path) => {
                const { typeAnnotation } = path.node;
                return (
                    typeAnnotation.typeName.type === 'TSQualifiedName' &&
                    typeAnnotation.typeName.left.name === 'StyleDictionary'
                );
            });

        if (typeDeclarations.size()) {
            // Extract the names of the types being declared
            const typesToImport = typeDeclarations
                .nodes()
                .map((node) => node.typeAnnotation.typeName.right.name);

            // Replace the import with the new type-specific import
            importDecl.replaceWith(
                j.importDeclaration(
                    typesToImport.map((typeName) =>
                        j.importSpecifier(j.identifier(typeName)),
                    ),
                    j.stringLiteral('style-dictionary/types'),
                    'type',
                ),
            );

            // Remove the old type declarations
            typeDeclarations.remove();
        }
    }

    return root.toSource();
}
