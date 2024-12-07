import StyleDictionary from 'style-dictionary';
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
