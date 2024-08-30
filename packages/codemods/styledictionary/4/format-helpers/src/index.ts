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

    // Find the import declaration for 'style-dictionary'
    const importDeclaration = root.find(j.ImportDeclaration, {
        source: {
            value: 'style-dictionary',
        },
    });

    // Check if formatHelpers is destructured from StyleDictionary
    importDeclaration.forEach((path) => {
        const localName = path.node.specifiers[0].local.name; // 'StyleDictionary'

        root.find(j.VariableDeclarator, {
            id: {
                type: 'ObjectPattern',
            },
            init: {
                object: {
                    name: localName,
                },
                property: {
                    name: 'formatHelpers',
                },
            },
        }).forEach((variablePath) => {
            // Get the properties being destructured
            const destructuredProperties = variablePath.node.id.properties.map(
                (prop) => prop.key.name,
            );

            // Remove the old destructuring
            j(variablePath).remove();

            // Add the new import statement from 'style-dictionary/utils'
            importDeclaration.insertAfter(
                j.importDeclaration(
                    destructuredProperties.map((property) =>
                        j.importSpecifier(j.identifier(property)),
                    ),
                    j.literal('style-dictionary/utils'),
                ),
            );
        });
    });

    // Remove the original StyleDictionary import if it no longer has any references
    const remainingReferences = root
        .find(j.Identifier, { name: 'StyleDictionary' })
        .size();

    if (remainingReferences === 0) {
        importDeclaration.remove();
    }

    return root.toSource();
}
