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
    const source = file.source;

    // Regular expression to find the content inside <script> tags and capture the entire opening tag
    const scriptTagRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gm;

    // Variable to hold the transformed source
    let transformedSource = source;
    let scriptFound = false;

    // Function to perform the transformation logic
    function transformCode(code) {
        const root = j(code);

        // Function to add 'mount' import from 'svelte'
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

        // Return the transformed code
        return root.toSource();
    }

    // First, handle the case with <script> tags
    transformedSource = transformedSource.replace(
        scriptTagRegex,
        (match, openingTag, scriptContent, closingTag) => {
            scriptFound = true;
            // Transform the extracted JavaScript content from <script> tags
            const transformedScriptContent = transformCode(scriptContent);
            // Replace the original <script> content with the transformed content, preserving the original opening tag
            return `${openingTag}\n${transformedScriptContent}\n${closingTag}`;
        },
    );

    // If no <script> tags were found, assume the code is JavaScript directly in the .svelte file
    if (!scriptFound) {
        transformedSource = transformCode(source);
    }

    return transformedSource;
}
