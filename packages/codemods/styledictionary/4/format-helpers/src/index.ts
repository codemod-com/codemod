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

    // Find all destructuring assignments of formatHelpers from StyleDictionary
    root.find(j.VariableDeclarator, {
        id: {
            type: 'ObjectPattern',
        },
        init: {
            type: 'MemberExpression',
            object: {
                name: 'StyleDictionary',
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
        const importDeclaration = j.importDeclaration(
            destructuredProperties.map((property) =>
                j.importSpecifier(j.identifier(property)),
            ),
            j.literal('style-dictionary/utils'),
        );

        root.find(j.Program).get('body', 0).insertBefore(importDeclaration);
    });

    return root.toSource();
}
