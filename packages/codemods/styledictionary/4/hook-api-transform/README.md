

This codemod updates registered transforms to be placed inside the `hooks.transforms` property, instead of `transform`, with a shift from the singular to the plural form. Additionally, the name of the filter function has been changed from `matcher` to `filter` for consistency.

## Before

```jsx
export default {
    // register it inline or by SD.registerTransform
    transform: {
        'color-transform': {
            type: 'value',
            matcher: (token) => token.type === 'color',
            transformer: (token) => token.value,
        },
    },
    platforms: {
        css: {
            // apply it per platform
            transforms: ['color-transform'],
        },
    },
};

```

## After

```jsx
export default {
    platforms: {
        css: {
            // apply it per platform
            transforms: ['color-transform'],
        },
    },

    hooks: {
        transforms: {
            'color-transform': {
                type: 'value',
                filter: (token) => token.type === 'color',
                transform: (token) => token.value,
            },
        },
    },
};

```
