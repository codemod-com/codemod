import StyleDictionary from 'style-dictionary';
export default {
    hooks: {
        preprocessors: {
            foo: (dictionary) => {
                // preprocess it
                return dictionary;
            },
        },
    },

    preprocessors: ['foo'],
};
