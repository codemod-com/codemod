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

    // Helper function to recursively find and transform transform properties
    function transformObjectProperties(objectExpression) {
        const properties = objectExpression.properties;

        properties.forEach((prop, index) => {
            if (
                prop.key.name === 'transform' &&
                prop.value.type === 'ObjectExpression'
            ) {
                // Create the hooks.transforms property
                const hooksProp = j.property(
                    'init',
                    j.identifier('hooks'),
                    j.objectExpression([
                        j.property(
                            'init',
                            j.identifier('transforms'),
                            prop.value,
                        ),
                    ]),
                );

                // Remove the old transform property
                properties.splice(index, 1);

                // Add the new hooks property
                properties.push(hooksProp);

                // Transform the inner properties of the transform object
                const transformProperties = prop.value.properties;
                transformProperties.forEach((transformProp) => {
                    if (transformProp.value.type === 'ObjectExpression') {
                        const innerProperties = transformProp.value.properties;
                        innerProperties.forEach((innerProp) => {
                            if (innerProp.key.name === 'matcher') {
                                innerProp.key.name = 'filter';
                            } else if (innerProp.key.name === 'transformer') {
                                innerProp.key.name = 'transform';
                            }
                        });
                    }
                });
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
