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
    const source = file.source;

    // Regular expression to find the content inside <script> tags
    const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gm;

    // Variable to hold the transformed source
    let transformedSource = source;
    let scriptFound = false;

    // Function to perform the transformation logic
    function transformCode(code) {
        const root = j(code);

        // Add 'mount' import if it's not present
        function addMountImport() {
            const svelteImport = root.find(j.ImportDeclaration, {
                source: { value: 'svelte' },
            });

            if (svelteImport.length > 0) {
                const mountSpecifier = svelteImport
                    .find(j.ImportSpecifier)
                    .filter(
                        (specifier) => specifier.node.imported.name === 'mount',
                    );

                if (mountSpecifier.length === 0) {
                    svelteImport
                        .get(0)
                        .node.specifiers.push(
                            j.importSpecifier(j.identifier('mount')),
                        );
                }
            } else {
                const importStatement = j.importDeclaration(
                    [j.importSpecifier(j.identifier('mount'))],
                    j.literal('svelte'),
                );
                root.find(j.ImportDeclaration)
                    .at(0)
                    .insertBefore(importStatement);
            }
        }

        // Find instantiations of Svelte components and replace them
        root.find(j.NewExpression, {
            callee: {
                type: 'Identifier',
            },
        }).forEach((path) => {
            const componentName = path.node.callee.name;

            // Check if the instantiation is for a Svelte component (imported from .svelte)
            const importDeclaration = root.find(j.ImportDeclaration, {
                specifiers: [{ local: { name: componentName } }],
                source: { value: (val) => val.endsWith('.svelte') },
            });

            if (importDeclaration.length > 0) {
                // Replace `new Component({ target })` with `mount(Component, { target })`
                j(path).replaceWith(
                    j.callExpression(j.identifier('mount'), [
                        j.identifier(componentName),
                        ...path.node.arguments,
                    ]),
                );
                addMountImport();
            }
        });

        // Find and replace $on method calls with events property
        root.find(j.CallExpression, {
            callee: {
                type: 'MemberExpression',
                property: {
                    type: 'Identifier',
                    name: '$on',
                },
            },
        }).forEach((path) => {
            const componentName = path.node.callee.object.name;
            const eventName = path.node.arguments[0];
            const callback = path.node.arguments[1];

            // Add events property to the mount options
            root.find(j.CallExpression, {
                callee: {
                    type: 'Identifier',
                    name: 'mount',
                },
            }).forEach((mountPath) => {
                const optionsArg = mountPath.node.arguments[1];
                if (optionsArg && optionsArg.type === 'ObjectExpression') {
                    const eventsProperty = optionsArg.properties.find(
                        (prop) => prop.key.name === 'events',
                    );
                    if (eventsProperty) {
                        eventsProperty.value.properties.push(
                            j.property('init', eventName, callback),
                        );
                    } else {
                        optionsArg.properties.push(
                            j.property(
                                'init',
                                j.identifier('events'),
                                j.objectExpression([
                                    j.property('init', eventName, callback),
                                ]),
                            ),
                        );
                    }
                }
            });

            // Remove the $on call
            j(path).remove();
        });

        return root.toSource();
    }

    // First, handle the case with <script> tags
    transformedSource = transformedSource.replace(
        scriptTagRegex,
        (match, scriptContent) => {
            scriptFound = true;
            // Transform the extracted JavaScript content from <script> tags
            const transformedScriptContent = transformCode(scriptContent);
            // Replace the original <script> content with the transformed content
            return `<script>\n${transformedScriptContent}\n</script>`;
        },
    );

    // If no <script> tags were found, assume the code is JavaScript directly in the .svelte file
    if (!scriptFound) {
        transformedSource = transformCode(source);
    }

    return transformedSource;
}
