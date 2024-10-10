

This codemod updates registered filters to be placed inside the `hooks.filters` property, instead of `filter`. Note the shift from the singular to the plural form in this update.

## Before

```jsx
export default {
    filter: {
        'colors-only': (token) => token.type === 'color',
    },
    platforms: {
        css: {
            files: [
                {
                    format: 'css/variables',
                    destination: '_variables.css',
                    filter: 'colors-only',
                },
            ],
        },
    },
};

```

## After

```jsx
export default {
    platforms: {
        css: {
            files: [
                {
                    format: 'css/variables',
                    destination: '_variables.css',
                    filter: 'colors-only',
                },
            ],
        },
    },

    hooks: {
        filters: {
            'colors-only': (token) => token.type === 'color',
        },
    },
};

```
