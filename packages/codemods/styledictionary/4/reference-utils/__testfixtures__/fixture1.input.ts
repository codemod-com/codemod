import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
    name: `myCustomFormat`,
    format: function ({ dictionary }) {
        return dictionary.allTokens
            .map((token) => {
                let value = JSON.stringify(token.value);
                if (dictionary.usesReferences(token.original.value)) {
                    const refs = dictionary.getReferences(token.original.value);
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
