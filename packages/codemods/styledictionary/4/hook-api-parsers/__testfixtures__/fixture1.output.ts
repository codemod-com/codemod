import StyleDictionary from 'style-dictionary';
export default {
    // register it inline or by SD.registerPreprocessor
    parsers: ['json5-parser'],

    hooks: {
        parsers: {
            'json5-parser': {
                pattern: /\.json5$/,

                parser: ({ contents, filePath }) => {
                    return JSON5.parse(contents);
                },
            },
        },
    },
};
