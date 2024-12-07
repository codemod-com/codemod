

This codemod updates registered file headers to be placed inside the `hooks.fileHeaders` property, instead of `fileHeader`. Note the shift from the singular to the plural form in this update.

## Before

```jsx
export default {
    fileHeader: {
        foo: (defaultMessages = []) => [
            'Ola, planet!',
            ...defaultMessages,
            'Hello, World!',
        ],
    },
    platforms: {
        css: {
            options: {
                fileHeader: 'foo',
            },
        },
    },
};

```

## After

```jsx
export default {
    platforms: {
        css: {
            options: {
                fileHeader: 'foo',
            },
        },
    },

    hooks: {
        fileHeaders: {
            foo: (defaultMessages = []) => [
                'Ola, planet!',
                ...defaultMessages,
                'Hello, World!',
            ],
        },
    },
};

```
