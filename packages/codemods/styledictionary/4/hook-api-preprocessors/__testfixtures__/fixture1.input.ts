export default {
    preprocessors: {
        foo: (dictionary) => {
            // preprocess it
            return dictionary;
        },
    },
    preprocessors: ['foo'],
    platforms: {
        css: {
            preprocessors: ['foo'],
        },
    },
};
