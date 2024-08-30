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
