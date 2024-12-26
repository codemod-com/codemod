export default {
    preprocessors: ['foo'],
    
    hooks: {
        preprocessors: {
            foo: (dictionary) => {
                // preprocess it
                return dictionary;
            },
        },
    },
};
