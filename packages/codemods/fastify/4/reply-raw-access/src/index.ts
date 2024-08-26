import type { API, FileInfo, Options } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options?: Options) {
    const j = api.jscodeshift;
    const root = j(file.source);
    let dirtyFlag = false;

    // Find all Fastify route handlers with callbacks
    root.find(j.CallExpression, {
        callee: {
            object: { name: 'fastify' },
            property: { name: 'get' }, // Assuming this is for `.get` method
        },
    }).forEach((path) => {
        const callback = path.node.arguments[1]; // Second argument is the callback

        if (j.FunctionExpression.check(callback) || j.ArrowFunctionExpression.check(callback)) {
            const params = callback.params;
            if (params.length >= 2) {
                const secondParam = params[1]; // Get the second parameter, e.g., `reply` or `random`

                if (j.Identifier.check(secondParam)) {
                    const secondParamName = secondParam.name;

                    // Now find all references to `${secondParamName}.res`
                    root.find(j.VariableDeclarator).forEach((path) => {
                        const init = path.node.init;

                        if (j.MemberExpression.check(init)) {
                            const object = init.object;
                            const property = init.property;

                            // Check if the member expression is `${secondParamName}.res`
                            if (
                                j.Identifier.check(object) &&
                                object.name === secondParamName &&
                                j.Identifier.check(property) &&
                                property.name === 'res'
                            ) {
                                // Replace `${secondParamName}.res` with `${secondParamName}.raw`
                                path.get('init').replace(
                                    j.memberExpression(
                                        j.identifier(secondParamName),
                                        j.identifier('raw'),
                                    ),
                                );
                                dirtyFlag = true;
                            }
                        }
                    });
                }
            }
        }
    });

    return dirtyFlag ? root.toSource() : undefined;
}

