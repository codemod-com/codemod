import StyleDictionary from 'style-dictionary';
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
