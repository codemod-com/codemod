import StyleDictionary from 'style-dictionary';
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
