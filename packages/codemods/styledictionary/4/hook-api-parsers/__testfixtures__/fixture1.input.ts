import StyleDictionary from 'style-dictionary';
export default {
    // register it inline or by SD.registerPreprocessor
    parsers: [
        {
            pattern: /\.json5$/,
            parse: ({ contents, filePath }) => {
                return JSON5.parse(contents);
            },
        },
    ],
};
