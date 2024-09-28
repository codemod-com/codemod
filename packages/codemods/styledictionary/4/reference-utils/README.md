## What Changed

This codemod updates the reference utilities to be available from the `style-dictionary/utils` entrypoint, instead of being attached to the `StyleDictionary` instance. The function signatures of these utilities have also been updated for better reuse and consistency in their APIs.

## Before

```jsx
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
    name: `myCustomFormat`,
    format: function ({ dictionary }) {
        return dictionary.allTokens
            .map((token) => {
                let value = JSON.stringify(token.value);
                if (dictionary.usesReferences(token.original.value)) {
                    const refs = dictionary.getReferences(token.original.value);
                    refs.forEach((ref) => {
                        value = value.replace(ref.value, function () {
                            return `${ref.name}`;
                        });
                    });
                }
                return `export const ${token.name} = ${value};`;
            })
            .join(`\n`);
    },
});

```

## After

```jsx
import StyleDictionary from 'style-dictionary';

import { usesReferences, getReferences } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: `myCustomFormat`,
    format: function ({ dictionary }) {
        return dictionary.allTokens
            .map((token) => {
                let value = JSON.stringify(token.value);
                if (usesReferences(token.original.value, dictionary.tokens)) {
                    const refs = getReferences(
                        token.original.value,
                        dictionary.tokens,
                    );
                    refs.forEach((ref) => {
                        value = value.replace(ref.value, function () {
                            return `${ref.name}`;
                        });
                    });
                }
                return `export const ${token.name} = ${value};`;
            })
            .join(`\n`);
    },
});

```
