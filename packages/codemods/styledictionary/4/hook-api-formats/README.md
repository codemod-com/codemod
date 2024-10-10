

This codemod updates registered formats to be placed inside the `hooks.formats` property, instead of `format`, with a shift from the singular to the plural form. Additionally, the formatter handler function has been renamed to `format` for consistency. Some importable type interfaces have also been renamed.

## Before

```jsx
import StyleDictionary from 'style-dictionary';
import type { Formatter, FormatterArguments } from 'style-dictionary/types';

// register it with register method
StyleDictionary.registerFormat({
    name: 'custom/json',
    formatter: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
});

export default {
    // OR define it inline
    format: {
        'custom/json': ({ dictionary }) => JSON.stringify(dictionary, null, 2),
    },
    platforms: {
        json: {
            files: [
                {
                    destination: 'output.json',
                    format: 'custom/json',
                },
            ],
        },
    },
};

```

## After

```jsx
import StyleDictionary from 'style-dictionary';
import type { FormatFn, FormatFnArguments } from 'style-dictionary/types';

// register it with register method
StyleDictionary.registerFormat({
    name: 'custom/json',
    format: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
});

export default {
    platforms: {
        json: {
            files: [
                {
                    destination: 'output.json',
                    format: 'custom/json',
                },
            ],
        },
    },

    hooks: {
        formats: {
            'custom/json': ({ dictionary }) =>
                JSON.stringify(dictionary, null, 2),
        },
    },
};

```
