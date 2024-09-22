import StyleDictionary from 'style-dictionary';

import { usesReferences, getReferences } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: `myCustomFormat`,
    format: function ({ dictionary }) {
        return dictionary.allTokens
            .map((token) => {
                let value = JSON.stringify(token.value);
                if (usesReferences(token.original.value, dictionary.tokens)) {
                    const refs = getReferences(
                        token.original.value,
                        dictionary.tokens,
                    );
                    refs.forEach((ref) => {
                        value = value.replace(ref.value, function () {
                            return `${ref.name}`;
                        });
                    });
                }
                return `export const ${token.name} = ${value};`;
            })
            .join(`\n`);
    },
});
