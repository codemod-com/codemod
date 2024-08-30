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

    root.find(j.ObjectExpression).forEach((path) => {
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
    });

    return root.toSource();
}
