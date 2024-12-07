

This codemod updates registered actions to be placed inside the `hooks.actions` property, instead of `action`. Note the shift from the singular to the plural form in this update.

## Before

```jsx
export default {
    action: {
        'copy-assets': {
            do: () => {},
            undo: () => {},
        },
    },
    platforms: {
        css: {
            actions: ['copy-assets'],
            files: [{ format: 'css/variables', destination: '_variables.css' }],
        },
    },
};

```

## After

```jsx
export default {
    platforms: {
        css: {
            actions: ['copy-assets'],
            files: [{ format: 'css/variables', destination: '_variables.css' }],
        },
    },

    hooks: {
        actions: {
            'copy-assets': {
                do: () => {},
                undo: () => {},
            },
        },
    },
};

```
