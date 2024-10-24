

This codemod updates registered preprocessors to be placed inside the `hooks.preprocessors` property, instead of `preprocessor`, with a shift from the singular to the plural form. Registered preprocessors now apply globally without requiring explicit application in the config.

## Before

```jsx
export default {
    preprocessors: {
        foo: (dictionary) => {
            // preprocess it
            return dictionary;
        },
    },
    preprocessors: ['foo'],
    platforms: {
        css: {
            preprocessors: ['foo'],
        },
    },
};

```

## After

```jsx
export default {
    preprocessors: ['foo'],

    platforms: {
        css: {
            preprocessors: ['foo'],
        },
    },

    hooks: {
        preprocessors: {
            foo: (dictionary) => {
                // preprocess it
                return dictionary;
            },
        },
    },
};

```
