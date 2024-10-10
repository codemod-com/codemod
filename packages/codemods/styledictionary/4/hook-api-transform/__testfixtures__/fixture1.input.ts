import StyleDictionary from 'style-dictionary';
export default {
    // register it inline or by SD.registerTransform
    transform: {
        'color-transform': {
            type: 'value',
            matcher: (token) => token.type === 'color',
            transformer: (token) => token.value,
        },
    },
    platforms: {
        css: {
            // apply it per platform
            transforms: ['color-transform'],
        },
    },
};
