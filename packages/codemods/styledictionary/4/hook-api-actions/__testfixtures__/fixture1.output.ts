import StyleDictionary from 'style-dictionary';
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
