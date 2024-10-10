

This codemod updates registered parsers to be placed inside the `hooks.parsers` property, instead of `parser`, with a shift from the singular to the plural form. Registered parsers now apply globally without needing explicit application in the config. Additionally, the `parse` function has been renamed to `parser` for consistency.

## Before

```jsx
export default {
    // register it inline or by SD.registerPreprocessor
    parsers: [
        {
            pattern: /\.json5$/,
            parse: ({ contents, filePath }) => {
                return JSON5.parse(contents);
            },
        },
    ],
};

```

## After

```jsx
export default {
    // register it inline or by SD.registerPreprocessor
    parsers: ['json5-parser'],

    hooks: {
        parsers: {
            name: 'json5-parser',
            pattern: /\.json5$/,

            parser: ({ contents, filePath }) => {
                return JSON5.parse(contents);
            },
        },
    },
};

```
