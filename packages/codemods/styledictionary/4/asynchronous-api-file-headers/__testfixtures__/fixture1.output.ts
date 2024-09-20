import StyleDictionary from 'style-dictionary';

// yes, this is another breaking change, more on that later
import { fileHeader } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: 'custom/css',
    // this can be async now, usually it is if you use fileHeader format helper, since that now always returns a Promise
    formatter: async function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return (
            (await fileHeader({ file })) +
            // this helper is now async! because the user-passed file.fileHeader might be an async function
            ':root {\n' +
            formattedVariables({
                format: 'css',
                dictionary,
                outputReferences,
            }) +
            '\n}\n'
        );
    },
});
