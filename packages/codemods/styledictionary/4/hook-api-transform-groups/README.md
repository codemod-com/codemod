

This codemod updates registered transform groups to be placed inside the `hooks.transformGroups` property, instead of `transformGroup`, with a shift from the singular to the plural form.

## Before

```jsx
export default {
    // register it inline or by SD.registerTransformGroup
    transformGroup: {
        foo: ['foo-transform'],
    },
    platforms: {
        css: {
            // apply it per platform
            transformGroup: ['foo'],
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
            transformGroup: ['foo'],
        },
    },

    hooks: {
        transformGroups: {
            foo: ['foo-transform'],
        },
    },
};

```
