import StyleDictionary from 'style-dictionary';
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
