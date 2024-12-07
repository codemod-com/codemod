import StyleDictionary from 'style-dictionary';
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
