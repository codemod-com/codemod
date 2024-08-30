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

    // Find the export default object
    root.find(j.ExportDefaultDeclaration)
        .find(j.ObjectExpression)
        .forEach((path) => {
            const properties = path.node.properties;

            // Find the preprocessors property
            const preprocessorPropIndex = properties.findIndex(
                (prop) =>
                    prop.key.name === 'preprocessors' &&
                    prop.value.type === 'ObjectExpression',
            );

            if (preprocessorPropIndex !== -1) {
                const preprocessorProp = properties[preprocessorPropIndex];

                // Create the hooks.preprocessors property
                const hooksProp = j.property(
                    'init',
                    j.identifier('hooks'),
                    j.objectExpression([
                        j.property(
                            'init',
                            j.identifier('preprocessors'),
                            preprocessorProp.value,
                        ),
                    ]),
                );

                // Remove the old preprocessors property
                properties.splice(preprocessorPropIndex, 1);

                // Add the new hooks property
                properties.push(hooksProp);
            }
        });

    return root.toSource();
}
