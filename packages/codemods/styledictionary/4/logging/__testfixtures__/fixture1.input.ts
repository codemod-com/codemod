const StyleDictionary = require('style-dictionary');

// Register a custom transform (if needed)
StyleDictionary.registerTransform({
    name: 'color/hex',
    type: 'value',
    matcher: (token) => token.type === 'color',
    transformer: (token) => token.value.toUpperCase(), // Example transformation
});

// Configure Style Dictionary
const config = {
    source: ['tokens.json'],
    log: {
        warnings: 'warn',
    },
    platforms: {
        css: {
            transformGroup: 'css',
            transforms: ['color/hex'],
            files: [
                {
                    destination: 'tokens.css',
                    format: 'css',
                },
            ],
        },
    },
};

// Initialize Style Dictionary with config
StyleDictionary.extend(config).buildAllPlatforms();
