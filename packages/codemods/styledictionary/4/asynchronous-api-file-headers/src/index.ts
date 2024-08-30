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

    // Find all fileHeader usages
    root.find(j.CallExpression, {
        callee: {
            name: 'fileHeader',
        },
    }).forEach((path) => {
        const call = path.node;

        // Check if fileHeader is used inside an async function
        let asyncFunction = false;
        let functionPath = path.parent;

        // Traverse up to find the enclosing function
        while (functionPath) {
            if (
                functionPath.node.type === 'FunctionDeclaration' ||
                functionPath.node.type === 'FunctionExpression' ||
                functionPath.node.type === 'ArrowFunctionExpression'
            ) {
                if (!functionPath.node.async) {
                    // Add async to the function if not already async
                    functionPath.node.async = true;
                    asyncFunction = true;
                }
                break;
            }
            functionPath = functionPath.parent;
        }

        // Ensure fileHeader is awaited if inside an async function
        if (asyncFunction) {
            if (call && call.type === 'CallExpression') {
                const awaitExpression = j.awaitExpression(call);
                j(path).replaceWith(awaitExpression);
            }
        }
    });

    return root.toSource();
}
