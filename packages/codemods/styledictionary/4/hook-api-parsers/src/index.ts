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

    // Function to transform parsers array to hooks.parsers object
    function transformParsersArray(path) {
        // Check if `parsers` is an array property
        const parsersProperty = path.value.properties.find(
            (prop) =>
                prop.key.name === 'parsers' &&
                j.ArrayExpression.check(prop.value),
        );

        if (parsersProperty) {
            const parserConfig = parsersProperty.value.elements[0]; // Assuming there's one parser object

            // Extract pattern and parse method from the existing config
            const patternProperty = parserConfig.properties.find(
                (p) => p.key.name === 'pattern',
            );
            const parseProperty = parserConfig.properties.find(
                (p) => p.key.name === 'parse',
            );

            // Generate the parser name based on the file extension in the pattern regex
            const patternRegex = patternProperty.value.regex.pattern; // e.g., /\.yaml$/ -> "yaml"
            const extensionMatch = patternRegex.match(/\\\.([a-z0-9]+)\$/);
            const parserName = extensionMatch
                ? `${extensionMatch[1]}-parser`
                : 'custom-parser';

            // Create the new `hooks.parsers` object
            const hooksProperty = j.property(
                'init',
                j.identifier('hooks'),
                j.objectExpression([
                    j.property(
                        'init',
                        j.identifier('parsers'),
                        j.objectExpression([
                            j.property(
                                'init',
                                j.identifier('name'),
                                j.literal(parserName),
                            ),
                            patternProperty,
                            j.property(
                                'init',
                                j.identifier('parser'),
                                parseProperty.value,
                            ),
                        ]),
                    ),
                ]),
            );

            // Replace `parsers` property with `parsers: [parserName]`
            parsersProperty.value = j.arrayExpression([j.literal(parserName)]);

            // Add the `hooks` property to the root object
            path.value.properties.push(hooksProperty);
        }
    }

    // Function to transform StyleDictionary.registerParser calls
    function transformRegisterParserCalls(path) {
        const args = path.node.arguments;

        // Ensure the first argument is an object expression
        if (args.length > 0 && args[0].type === 'ObjectExpression') {
            const properties = args[0].properties;

            // Check if 'name' property already exists
            const hasNameProperty = properties.some(
                (prop) => prop.key.name === 'name',
            );

            // If 'name' property does not exist, add it
            if (!hasNameProperty) {
                properties.unshift(
                    j.property(
                        'init',
                        j.identifier('name'),
                        j.literal('parser-foo'),
                    ),
                );
            }

            // Find and rename 'parse' property to 'parser'
            properties.forEach((prop) => {
                if (prop.key.name === 'parse') {
                    prop.key.name = 'parser'; // Rename parse to parser
                }
            });
        }
    }

    // Apply the transformation for parsers array to hooks.parsers object
    root.find(j.ObjectExpression).forEach(transformParsersArray);

    // Apply the transformation for StyleDictionary.registerParser calls
    root.find(j.CallExpression, {
        callee: {
            object: { name: 'StyleDictionary' },
            property: { name: 'registerParser' },
        },
    }).forEach(transformRegisterParserCalls);

    return root.toSource();
}
