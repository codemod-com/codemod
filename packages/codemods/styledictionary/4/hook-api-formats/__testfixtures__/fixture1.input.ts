import StyleDictionary from 'style-dictionary';
import type { Formatter, FormatterArguments } from 'style-dictionary/types';

// register it with register method
StyleDictionary.registerFormat({
    name: 'custom/json',
    formatter: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
});

export default {
    // OR define it inline
    format: {
        'custom/json': ({ dictionary }) => JSON.stringify(dictionary, null, 2),
    },
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
};
