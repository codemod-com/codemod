import type {
    API,
    ArrowFunctionExpression,
    FileInfo,
    Options,
} from 'jscodeshift';

export default function transform(
    file: FileInfo,
    api: API,
    options?: Options,
): string | undefined {
    const j = api.jscodeshift;

    // Methods that should be awaited
    const asyncMethods = [
        'cleanAllPlatforms',
        'buildAllPlatforms',
        'extend',
        'exportPlatform',
        'getPlatform',
        'buildPlatform',
        'cleanPlatform',
    ];

    const root = j(file.source);

    // Find all function declarations, function expressions, and arrow functions
    root.find(j.FunctionDeclaration).forEach((path) =>
        addAsyncIfNeeded(path, j),
    );

    root.find(j.FunctionExpression).forEach((path) =>
        addAsyncIfNeeded(path, j),
    );

    root.find(j.ArrowFunctionExpression).forEach((path) =>
        addAsyncIfNeeded(path, j),
    );

    // Add 'await' before the relevant method calls, except for StyleDictionary.extend()
    asyncMethods.forEach((method) => {
        root.find(j.CallExpression, {
            callee: { property: { name: method } },
        }).forEach((path) => {
            // Check if the method is already awaited
            if (!j.AwaitExpression.check(path.parent.node)) {
                // Skip if it's StyleDictionary.extend()
                if (
                    !(
                        path.node.callee.object &&
                        path.node.callee.object.name === 'StyleDictionary' &&
                        path.node.callee.property.name === 'extend'
                    )
                ) {
                    j(path).replaceWith(j.awaitExpression(path.node));
                }
            }
        });
    });

    return root.toSource();

    // Helper function to add 'async' if needed
    function addAsyncIfNeeded(path, j) {
        // Check if the function body contains any of the async methods
        const containsAsyncMethod = j(path)
            .find(j.CallExpression)
            .some((callPath) =>
                asyncMethods.includes(callPath.node.callee.property?.name),
            );

        // Only mark as async if it contains one of the async methods
        if (containsAsyncMethod && !path.node.async) {
            path.node.async = true;
        }
    }
}
