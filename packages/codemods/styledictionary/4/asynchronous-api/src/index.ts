import type { API, FileInfo, Options } from 'jscodeshift';

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

    // Keep track of variables declared using StyleDictionary
    const styleDictionaryVars: Set<string> = new Set();

    // Identify variables assigned using StyleDictionary.extend or new StyleDictionary
    root.find(j.VariableDeclarator).forEach((path) => {
        const init = path.node.init;

        // Handle StyleDictionary.extend() pattern
        if (
            j.CallExpression.check(init) &&
            init.callee.type === 'MemberExpression' &&
            init.callee.object.name === 'StyleDictionary' &&
            init.callee.property.name === 'extend'
        ) {
            styleDictionaryVars.add(path.node.id.name);
        }

        // Handle new StyleDictionary() pattern
        if (
            j.NewExpression.check(init) &&
            init.callee.name === 'StyleDictionary'
        ) {
            styleDictionaryVars.add(path.node.id.name);
        }
    });

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

    // Add 'await' before the relevant method calls, only for variables declared using StyleDictionary
    asyncMethods.forEach((method) => {
        root.find(j.CallExpression, {
            callee: { property: { name: method } },
        }).forEach((path) => {
            const objectName = path.node.callee.object.name;

            // Ensure the method is called on a variable initialized with StyleDictionary
            if (styleDictionaryVars.has(objectName)) {
                // Check if the method is already awaited
                if (!j.AwaitExpression.check(path.parent.node)) {
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
