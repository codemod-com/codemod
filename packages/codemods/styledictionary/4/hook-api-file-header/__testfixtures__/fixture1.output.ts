import StyleDictionary from 'style-dictionary';

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
