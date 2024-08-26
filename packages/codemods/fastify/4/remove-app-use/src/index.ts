import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Check if fastify is required and assigned to a variable
    const fastifyRequire = root.find(j.VariableDeclarator, {
        id: { name: 'fastify' },
        init: {
            type: 'CallExpression',
            callee: {
                type: 'CallExpression',
                callee: { name: 'require' },
                arguments: [{ value: 'fastify' }],
            },
        },
    });

    const importDeclarations = root.find(j.VariableDeclaration, {
        declarations: [
            {
                id: { name: 'fastify' },
                init: {
                    type: 'CallExpression',
                    callee: {
                        type: 'CallExpression',
                        callee: { name: 'require' },
                        arguments: [{ value: 'fastify' }],
                    },
                },
            },
        ],
    });

    if (fastifyRequire.size() > 0) {
        // Add the middie require statement
        const middieRequire = j.variableDeclaration('const', [
            j.variableDeclarator(
                j.identifier('middie'),
                j.callExpression(j.identifier('require'), [
                    j.literal('@fastify/middie'),
                ]),
            ),
        ]);

        // Register middie with fastify
        const fastifyInstance = fastifyRequire.get().node.id;
        const registerMiddie = j.expressionStatement(
            j.callExpression(
                j.memberExpression(fastifyInstance, j.identifier('register')),
                [j.identifier('middie')],
            ),
        );

        // Find the location where the Fastify instance is created
        const fastifyInstanceCreation = root.find(j.ExpressionStatement, {
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: { name: 'fastify' },
                    property: { name: 'use' },
                },
            },
        });

        if (fastifyInstanceCreation.size() > 0) {
            // Insert the register statement before the first use of fastify.use
            // Insert the middie require statement after the fastify require statement
            importDeclarations.insertAfter(middieRequire);
            fastifyInstanceCreation.insertBefore(registerMiddie);
            dirtyFlag = true;
        }
    }

    return dirtyFlag ? root.toSource({ quote: 'single' }) : undefined;
}
