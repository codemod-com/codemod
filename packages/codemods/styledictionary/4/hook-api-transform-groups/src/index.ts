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

    // Helper function to recursively find and transform transformGroup properties
    function transformObjectProperties(objectExpression) {
        const properties = objectExpression.properties;

        properties.forEach((prop, index) => {
            if (
                prop.key.name === 'transformGroup' &&
                prop.value.type === 'ObjectExpression'
            ) {
                // Create the hooks.transformGroups property
                const hooksProp = j.property(
                    'init',
                    j.identifier('hooks'),
                    j.objectExpression([
                        j.property(
                            'init',
                            j.identifier('transformGroups'),
                            prop.value,
                        ),
                    ]),
                );

                // Remove the old transformGroup property
                properties.splice(index, 1);

                // Add the new hooks property
                properties.push(hooksProp);
            } else if (prop.value.type === 'ObjectExpression') {
                // Recursively transform nested objects
                transformObjectProperties(prop.value);
            }
        });
    }

    // Find all object expressions in the file and transform them
    root.find(j.ObjectExpression).forEach((path) => {
        transformObjectProperties(path.node);
    });

    return root.toSource();
}
