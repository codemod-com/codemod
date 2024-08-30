import StyleDictionary from 'style-dictionary';
import type { FormatFn, FormatFnArguments } from 'style-dictionary/types';

// register it with register method
StyleDictionary.registerFormat({
    name: 'custom/json',
    format: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
});

export default {
    platforms: {
        json: {
            files: [
                {
                    destination: 'output.json',
                    format: 'custom/json',
                },
            ],
        },
    },

    hooks: {
        formats: {
            'custom/json': ({ dictionary }) =>
                JSON.stringify(dictionary, null, 2),
        },
    },
};
