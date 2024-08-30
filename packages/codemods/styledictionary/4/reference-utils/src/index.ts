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

    // Map of reference utilities to their corresponding method names
    const referenceUtils = {
        usesReferences: 'usesReferences',
        getReferences: 'getReferences',
        // Add more references here as needed from the documentation
        isReference: 'isReference',
        resolveReferences: 'resolveReferences',
        flattenReferences: 'flattenReferences',
        outputReferencesFilter: 'outputReferencesFilter',
        outputReferencesTransformed: 'outputReferencesTransformed',
    };

    // Track which utilities are used in the file
    const usedReferences = new Set();

    // Step 1: Replace the relevant method calls in the code and track usage
    Object.entries(referenceUtils).forEach(([oldMethod, newMethod]) => {
        root.find(j.CallExpression, {
            callee: {
                object: { name: 'dictionary' },
                property: { name: oldMethod },
            },
        }).forEach((path) => {
            // Replace the original call with the new utility function
            j(path).replaceWith(
                j.callExpression(j.identifier(newMethod), [
                    path.node.arguments[0],
                    j.memberExpression(
                        j.identifier('dictionary'),
                        j.identifier('tokens'),
                    ),
                ]),
            );

            // Track that this utility is used
            usedReferences.add(newMethod);
        });
    });

    // Step 2: Add imports only for the utilities that are actually used
    if (usedReferences.size > 0) {
        const existingUtilsImport = root.find(j.ImportDeclaration, {
            source: { value: 'style-dictionary/utils' },
        });

        if (existingUtilsImport.size() === 0) {
            // Create a new import statement for the used utilities
            const newImport = j.importDeclaration(
                Array.from(usedReferences).map((util) =>
                    j.importSpecifier(j.identifier(util)),
                ),
                j.literal('style-dictionary/utils'),
            );

            // Insert the new import after the main style-dictionary import
            const styleDictionaryImport = root.find(j.ImportDeclaration, {
                source: { value: 'style-dictionary' },
            });

            if (styleDictionaryImport.size() > 0) {
                styleDictionaryImport.insertAfter(newImport);
            } else {
                root.get().node.program.body.unshift(newImport);
            }
        } else {
            // Update the existing import statement to include only the used utilities
            existingUtilsImport.forEach((path) => {
                const existingSpecifiers = path.node.specifiers.map(
                    (spec) => spec.local.name,
                );
                const newSpecifiers = Array.from(usedReferences)
                    .filter((util) => !existingSpecifiers.includes(util))
                    .map((util) => j.importSpecifier(j.identifier(util)));
                path.node.specifiers.push(...newSpecifiers);
            });
        }
    }

    return root.toSource({ quote: 'single' });
}
