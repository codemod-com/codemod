

This codemod updates the `fileHeader` format helper utility to be asynchronous, allowing support for async fileHeaders while maintaining consistency with the latest updates.

## Before

```jsx
import StyleDictionary from 'style-dictionary';
import { fileHeader } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: 'custom/css',
    formatter: function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return (
            fileHeader({ file })
            ':root {\n' +
            formattedVariables({
                format: 'css',
                dictionary,
                outputReferences,
            }) +
            '\n}\n'
        );
    },
});

```

## After

```jsx
import StyleDictionary from 'style-dictionary';
import { fileHeader } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: 'custom/css',
    format: async function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return (
            (await fileHeader({ file }))
            ':root {\n' +
            formattedVariables({
                format: 'css',
                dictionary,
                outputReferences,
            }) +
            '\n}\n'
        );
    },
});

```
