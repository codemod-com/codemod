import StyleDictionary from 'style-dictionary';

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
